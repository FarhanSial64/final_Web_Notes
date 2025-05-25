// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    unique: true,
    required: true // Make sure every product has a code
  },
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  images: {
    type: [String], // Array of image URLs or file names
    default: []
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);