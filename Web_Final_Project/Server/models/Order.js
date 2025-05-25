// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Customer
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  placedAt: { type: Date, default: Date.now },
  salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Salesman assigned
  deliveryTracking: {
    trackingId: String,
    provider: String,
    status: String
  },
  shippingAddress: String,
  paymentMethod: { type: String, enum: ['COD', 'Online'] }
});

module.exports = mongoose.model('Order', OrderSchema);
