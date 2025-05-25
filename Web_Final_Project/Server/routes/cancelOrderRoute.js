const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');

// Simple test route
router.get('/test', (req, res) => {
  console.log('Cancel order test route hit');
  res.json({ message: 'Cancel order test route is working' });
});

// Cancel order route
router.put('/:orderId', async (req, res) => {
  try {
    console.log('Cancel order request received:', {
      method: req.method,
      url: req.originalUrl,
      params: req.params
    });
    
    const { orderId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update the order status to cancelled
    order.orderStatus = 'cancelled';
    await order.save();
    
    // Return the updated order
    const updatedOrder = await Order.findById(orderId).populate('items.product');
    
    res.json({ 
      message: 'Order cancelled successfully', 
      order: updatedOrder 
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
