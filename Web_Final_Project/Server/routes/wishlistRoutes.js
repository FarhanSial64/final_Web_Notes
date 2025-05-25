const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController'); // Make sure the path is correct
const authenticate = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware

// Get wishlist for a user
router.get('/', authenticate, getWishlist);

// Add a product to the wishlist
router.post('/add', authenticate, addToWishlist);

// Remove a product from the wishlist
router.delete('/remove', authenticate, removeFromWishlist);

module.exports = router;
