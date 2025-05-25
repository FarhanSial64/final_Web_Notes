// models/InventoryLog.js
const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  action: { type: String, enum: ['stock_in', 'stock_out'] },
  quantity: Number,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //admin only
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);
