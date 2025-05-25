const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const Role = require('../models/Role');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// ==========================
// 🔐 SIGNUP CONTROLLER
// ==========================
const signup = async (req, res) => {
  console.log('📥 Signup Request:', req.body);
  const { name, email, password, phone, role, recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'reCAPTCHA token is missing' });
  }

  try {
    // ✅ Verify reCAPTCHA token
    const recaptchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ message: 'Failed reCAPTCHA verification' });
    }

    // ✅ Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Validate role
    const userRole = await Role.findById(role);
    if (!userRole) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    // ✅ Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: userRole._id,
    });

    await newUser.save();

    const htmlContent = `
      <h2>Welcome to Our App, ${name}!</h2>
      <p>Your account has been successfully created.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> (hidden for your security)</p>
      <p>Click below to log in to your account:</p>
      <a href="http://localhost:3000/login" style="padding: 10px 15px; background-color: #28a745; color: white; border-radius: 5px; text-decoration: none;">Login Now</a>
      <br /><br />
      <p>If you did not sign up, please ignore this email.</p>
    `;

    await sendEmail(email, 'Welcome to Our App!', htmlContent);

    // ✅ Send response
    res.status(201).json({
      message: 'Signup successful! Please check your email.',
    });

  } catch (err) {
    console.error('❌ Signup Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ==========================
// 🔓 LOGIN CONTROLLER
// ==========================
const login = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ error: 'reCAPTCHA token is missing' });
  }

  try {
    // ✅ Verify reCAPTCHA
    const recaptchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ error: 'Failed reCAPTCHA verification' });
    }

    // ✅ Find user
    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // ✅ Issue token with proper role handling
    let roleName;
    if (typeof user.role === 'string') {
      roleName = user.role;
    } else if (user.role && user.role.name) {
      roleName = user.role.name;
    } else {
      roleName = 'customer'; // Default fallback
    }

    console.log('Creating token with role:', roleName);

    const token = jwt.sign(
      { _id: user._id, role: roleName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Increased to 7 days for better user experience
    );

    // Construct the image URL if it exists
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userImage = user.image ?
      (user.image.startsWith('http') ? user.image : `${baseUrl}${user.image}`) :
      null;

    console.log('User image path:', user.image);
    console.log('Full image URL:', userImage);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        image: userImage,
        phone: user.phone,
        address: user.address
      },
    });
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};


const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    // If user doesn't exist, create one
    if (!user) {
      const role = await Role.findOne({ name: 'customer' }); // Adjust as needed
      user = await User.create({
        name,
        email,
        picture,
        password: '', // No password for Google user
        isGoogleUser: true,
        role: role?._id || '67fdfc40c3818a16811991da',
      });

        const htmlContent = `
          <h2>Welcome to Our App, ${name}!</h2>
          <p>Your account has been successfully created.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> (hidden for your security)</p>
          <p>Click below to log in to your account:</p>
          <a href="http://localhost:3000/login" style="padding: 10px 15px; background-color: #28a745; color: white; border-radius: 5px; text-decoration: none;">Login Now</a>
          <br /><br />
          <p>If you did not sign up, please ignore this email.</p>
        `;

      await sendEmail(email, 'Welcome to Our Far Mart!', htmlContent);
    }

    // Get user with populated role
    const populatedUser = await User.findById(user._id).populate('role');

    // Determine role name
    let roleName;
    if (populatedUser.role) {
      if (typeof populatedUser.role === 'string') {
        roleName = populatedUser.role;
      } else if (populatedUser.role.name) {
        roleName = populatedUser.role.name;
      } else {
        roleName = 'customer'; // Default fallback
      }
    } else {
      roleName = 'customer'; // Default fallback
    }

    console.log('Creating Google auth token with role:', roleName);

    // Generate JWT token with role
    const token = jwt.sign({
      _id: user._id,
      role: roleName
    }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Increased to 7 days for better user experience
    });

    // Construct the image URL if it exists
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userImage = user.image ?
      (user.image.startsWith('http') ? user.image : `${baseUrl}${user.image}`) :
      user.picture; // Use picture from Google if no image is set

    console.log('Google auth - User image path:', user.image || user.picture);
    console.log('Google auth - Full image URL:', userImage);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role ? (typeof user.role === 'object' ? user.role.name : user.role) : 'customer',
        image: userImage,
        phone: user.phone,
        address: user.address
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};


module.exports = {
  signup,
  login,
  googleAuth,
};
