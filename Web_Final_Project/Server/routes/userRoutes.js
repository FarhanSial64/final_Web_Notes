const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfileImage, verifyToken } = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const upload = require('../middlewares/uploadMiddleware');


// View current user's profile
router.get('/profile', authenticate, getProfile);

// Update current user's profile
router.put('/profile', authenticate, upload.single('image'), updateProfile);

// Verify token endpoint
router.get('/verify-token', authenticate, verifyToken);

module.exports = router;
