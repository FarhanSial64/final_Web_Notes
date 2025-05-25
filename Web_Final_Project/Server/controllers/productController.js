const Product = require('../models/Product');
const mongoose = require('mongoose');

// GET /api/products
exports.getAllProducts = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sort,
        minPrice,
        maxPrice,
      } = req.query;

      const filter = {};

      if (category && category !== 'All') {
        filter.category = category;
      }

      if (search) {
        filter.name = { $regex: search, $options: 'i' };
      }

      if (minPrice && maxPrice) {
        filter.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
      }

      let query = Product.find(filter);

      // Sorting
      if (sort === 'lowToHigh') query = query.sort({ price: 1 });
      else if (sort === 'highToLow') query = query.sort({ price: -1 });

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Product.countDocuments(filter);
      const products = await query.skip(skip).limit(Number(limit));

      res.json({ products, total });
    } catch (err) {
      console.error("Error fetching all products:", err);
      res.status(500).json({ message: 'Failed to retrieve products.' });
    }
};

// GET /api/products/id/:id
exports.getProductById = async (req, res) => {
    const id = req.params.id || req.params.productCode;

    if (!id) {
        return res.status(400).json({ message: "Product ID is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID format." });
    }

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(product);
    } catch (err) {
        console.error(`Error fetching product with ID ${id}:`, err);
        res.status(500).json({ message: 'Failed to retrieve product.' });
    }
};

// GET /api/products/:productCode
exports.getProductByCode = async (req, res) => {
    const { productCode } = req.params;
    if (!productCode) {
        return res.status(400).json({ message: "Product code is required." });
    }
    try {
        const product = await Product.findOne({ productCode: productCode });
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(product);
    } catch (err) {
        console.error(`Error fetching product with code ${productCode}:`, err);
        res.status(500).json({ message: 'Failed to retrieve product.' });
    }
};