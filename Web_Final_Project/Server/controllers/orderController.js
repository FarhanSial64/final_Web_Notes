const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.placeOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product').session(session);
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Cart is empty' });
        }

        console.log('Cart items before creating order:', JSON.stringify(cart.items, null, 2));

        // Create order items with proper price information
        const orderItems = cart.items.map(item => {
            if (!item.product || !item.product.price) {
                console.error('Missing product or price for item:', item);
            }
            return {
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price // Set the price from the product
            };
        });

        console.log('Order items after mapping:', JSON.stringify(orderItems, null, 2));

        // Calculate total amount
        const totalAmount = cart.items.reduce((acc, item) => {
            const price = item.product && item.product.price ? item.product.price : 0;
            return acc + (price * item.quantity);
        }, 0);

        console.log('Calculated total amount:', totalAmount);

        const order = new Order({
            user: req.user.id,
            items: orderItems,
            totalAmount: totalAmount,
            orderStatus: 'pending' // Use orderStatus instead of status to match the schema
        });

        console.log('Order before saving:', JSON.stringify(order, null, 2));

        await order.save({ session });

        // Verify the saved order
        const savedOrder = await Order.findById(order._id).session(session);
        console.log('Saved order:', JSON.stringify(savedOrder, null, 2));

        await Cart.deleteOne({ user: req.user.id }).session(session);

        await session.commitTransaction();
        session.endSession();

        // Return the populated order
        const populatedOrder = await Order.findById(order._id).populate('items.product');
        res.status(201).json({ message: 'Order placed', order: populatedOrder });
    } catch (err) {
        console.error('Error placing order:', err);
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getOrderHistory = async (req, res) => {
  try {
    console.log('Getting order history for user:', req.user.id);

    const orders = await Order.find({ user: req.user.id }).populate('items.product');

    console.log('Found orders:', orders.length);

    // Process orders to ensure prices are set correctly
    const processedOrders = orders.map(order => {
      // Create a plain object from the Mongoose document
      const plainOrder = order.toObject();

      // Calculate total if not set
      if (!plainOrder.totalAmount) {
        plainOrder.totalAmount = plainOrder.items.reduce((total, item) => {
          const price = item.price || (item.product && item.product.price) || 0;
          return total + (price * item.quantity);
        }, 0);
      }

      // Ensure each item has a price
      plainOrder.items = plainOrder.items.map(item => {
        if (!item.price && item.product) {
          item.price = item.product.price || 0;
        }
        return item;
      });

      return plainOrder;
    });

    console.log('Processed orders sample:',
      processedOrders.length > 0 ?
      JSON.stringify({
        id: processedOrders[0]._id,
        totalAmount: processedOrders[0].totalAmount,
        itemsCount: processedOrders[0].items.length,
        sampleItem: processedOrders[0].items.length > 0 ? {
          price: processedOrders[0].items[0].price,
          productName: processedOrders[0].items[0].product?.name
        } : null
      }) : 'No orders'
    );

    res.json(processedOrders);
  } catch (err) {
    console.error('Error getting order history:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.trackOrder = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }
    try {
        const order = await Order.findById(req.params.orderId).populate('items.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Create a plain object from the Mongoose document
        const plainOrder = order.toObject();

        // Calculate total if not set
        if (!plainOrder.totalAmount) {
            plainOrder.totalAmount = plainOrder.items.reduce((total, item) => {
                const price = item.price || (item.product && item.product.price) || 0;
                return total + (price * item.quantity);
            }, 0);
        }

        // Ensure each item has a price
        plainOrder.items = plainOrder.items.map(item => {
            if (!item.price && item.product) {
                item.price = item.product.price || 0;
            }
            return item;
        });

        res.json(plainOrder);
    } catch (err) {
        console.error('Error tracking order:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
    }

    try {
        // Find the order
        const order = await Order.findById(req.params.orderId);

        // Check if order exists
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the order belongs to the current user
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Check if the order is in pending status
        if (order.orderStatus !== 'pending') {
            return res.status(400).json({
                message: 'Only pending orders can be cancelled',
                currentStatus: order.orderStatus
            });
        }

        // Update the order status to cancelled
        order.orderStatus = 'cancelled';
        await order.save();

        // Return the updated order
        const updatedOrder = await Order.findById(req.params.orderId).populate('items.product');

        // Create a plain object from the Mongoose document
        const plainOrder = updatedOrder.toObject();

        // Ensure each item has a price (same processing as in other functions)
        plainOrder.items = plainOrder.items.map(item => {
            if (!item.price && item.product) {
                item.price = item.product.price || 0;
            }
            return item;
        });

        res.json({
            message: 'Order cancelled successfully',
            order: plainOrder
        });
    } catch (err) {
        console.error('Error cancelling order:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
