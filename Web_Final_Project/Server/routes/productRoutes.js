const express = require('express');
const router = express.Router();
const { getAllProducts, getProductByCode, getProductById } = require('../controllers/productController');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    try {
        await getAllProducts(req, res);
    } catch (error) {
        //Handle error from controller if needed.
    }
});

// Route to get product by ID
router.get('/id/:id', async (req, res) => {
    try {
        await getProductById(req, res);
    } catch (error) {
        //Handle error from controller if needed.
    }
});

// Route to get product by product code
router.get('/:productCode', async (req, res) => {
    // If it looks like a MongoDB ID, redirect to the ID route
    if (mongoose.Types.ObjectId.isValid(req.params.productCode)) {
        return getProductById(req, res);
    }

    try {
        await getProductByCode(req, res);
    } catch (error) {
        //Handle error from controller if needed.
    }
});

module.exports = router;