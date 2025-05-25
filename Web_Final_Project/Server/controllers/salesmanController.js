const Order = require('../models/Order');
const Product = require('../models/Product');
const SalesReport = require('../models/SalesReport');
const User = require('../models/User');

// GET /salesman/dashboard
exports.getSalesmanDashboard = async (req, res) => {
  try {
    const orders = await Order.find({ salesman: req.user.id }).populate('customer');
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    res.status(200).json({
      message: 'Salesman Dashboard Data',
      totalOrders,
      totalRevenue,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

// GET /salesman/orders
exports.getSalesmanOrders = async (req, res) => {
  try {
    const orders = await Order.find({ salesman: req.user.id })
      .populate('customer', 'name email')
      .populate('products.product');

    res.status(200).json({
      message: 'Orders assigned to salesman',
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// PUT /salesman/order/:orderId/status
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findOne({ _id: orderId, salesman: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found or unauthorized' });

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// GET /salesman/sales-report
exports.getSalesmanReport = async (req, res) => {
  try {
    const reports = await SalesReport.find()
      .populate('product')
      .sort({ generatedAt: -1 });

    res.status(200).json({
      message: 'Salesman Sales Reports',
      reports
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales report', error: error.message });
  }
};
