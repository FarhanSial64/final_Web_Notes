const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const authenticate = require('../middlewares/authMiddleware');

router.post('/add', authenticate, addToCart);
router.get('/', authenticate, getCart);
router.put('/update', authenticate, updateCartItem);
router.delete('/remove/:productCode', authenticate, removeCartItem);


module.exports = router;
