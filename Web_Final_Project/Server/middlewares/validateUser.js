const { check, body, validationResult } = require('express-validator');
const User = require('../models/User');

// ✅ Validation for Signup
const validateSignup = [
  check('name').not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Please provide a valid email'),
  check('password').isLength({ min: 4 }).withMessage('Password must be at least 6 characters'),
  check('phone').not().isEmpty().withMessage('Phone number is required'),

  //console.log('Validation Middleware: '),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// ✅ Validation for Login
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// ✅ Middleware to check if email already exists
const checkEmailExists = async (req, res, next) => {
  const { email } = req.body;
  console.log('Checking if email exists:');
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { validateSignup, validateLogin, checkEmailExists };
