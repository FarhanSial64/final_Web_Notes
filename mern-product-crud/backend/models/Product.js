const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  qty: Number,
  price: Number
});
module.exports = mongoose.model("Product", productSchema);
