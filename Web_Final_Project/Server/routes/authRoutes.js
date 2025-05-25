// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { validateSignup, validateLogin, checkEmailExists } = require('../middlewares/validateUser');
const { signup, login, googleAuth } = require('../controllers/authController'); // Import the signup controller

// POST /signup - User signup route
router.post('/signup', validateSignup, checkEmailExists, signup);
router.post('/login', validateLogin, login);
router.post('/google', googleAuth);

module.exports = router;
