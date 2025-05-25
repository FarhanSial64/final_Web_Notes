const express = require('express');
const router = express.Router();
const {
  sendContactEmail,
  sendForgotPasswordEmail,
  resetPassword,
} = require('../controllers/emailController');

router.post('/contact', sendContactEmail);
router.post('/forgot-password', sendForgotPasswordEmail);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
