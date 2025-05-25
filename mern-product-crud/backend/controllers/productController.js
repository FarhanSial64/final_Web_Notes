const Product = require("../models/Product");

exports.getProducts = async (_, res) => {
  const products = await Product.find();
  res.json(products);
};

exports.addProduct = async (req, res) => {
  const { name, description, qty, price } = req.body;
  const newProduct = new Product({ name, description, qty, price });
  await newProduct.save();
  res.json({ msg: "Product added" });
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, qty, price } = req.body;
  await Product.findByIdAndUpdate(id, { name, description, qty, price });
  res.json({ msg: "Product updated" });
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ msg: "Product deleted" });
};
