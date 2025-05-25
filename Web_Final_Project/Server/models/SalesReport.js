// models/SalesReport.js
const mongoose = require('mongoose');

const SalesReportSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  salesman: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
  totalSales: Number,
  quantitySold: Number,
  period: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  lastSoldDate: Date,
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SalesReport', SalesReportSchema);
