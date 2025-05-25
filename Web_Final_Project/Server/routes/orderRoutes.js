const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { placeOrder, getOrderHistory, trackOrder, cancelOrder } = require('../controllers/orderController');
const authenticate = require('../middlewares/authMiddleware');

router.post('/place', authenticate, placeOrder);
router.get('/history', authenticate, getOrderHistory);
router.get('/track/:orderId', authenticate, trackOrder);

// Simple test route to check if server is recognizing new routes
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Test route is working' });
});
// Direct cancel route without middleware for testing
router.put('/cancel/:orderId', async (req, res) => {
  try {
    console.log('Cancel order request received:', {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      body: req.body
    });

    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const Order = require('../models/Order');
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order status to cancelled
    order.orderStatus = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    console.error('Error in cancel route:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
