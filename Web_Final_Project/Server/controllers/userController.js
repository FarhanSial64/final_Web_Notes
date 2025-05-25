const User = require('../models/User');
const path = require('path');
const jwt = require('jsonwebtoken');

// @desc Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userWithFullImage = {
      ...user.toObject(),
      image: user.image ? `${baseUrl}${user.image}` : null
    };

    res.json(userWithFullImage);
  } catch (err) {
    console.error('Get Profile Error:', err.message);
    res.status(500).json({ message: 'Failed to retrieve profile.' });
  }
};


// @desc Update user profile
const updateProfile = async (req, res) => {
  try {
    console.log('Request Body:', req.body);  // Log the form data (name, phone, address, etc.)
    console.log('File Uploaded:', req.file);  // Log the uploaded file (image)

    const { name, phone, address } = req.body;
    let image;

    if (req.file) {
      image = `/uploads/users/${req.file.filename}`;
    }

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required.' });
    }

    const updateData = {
      name,
      phone,
      address,
      updatedAt: new Date(),
      ...(image && { image }),
    };

    console.log('Update Data:', updateData);  // Log the data that will be updated in the DB

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password').populate('role');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};


// @desc Upload user profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    const imagePath = `/uploads/users/${req.file.filename}`; // public access path (adjust if needed)

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { image: imagePath, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: updatedUser.image,
      user: updatedUser
    });
  } catch (err) {
    console.error('Upload Image Error:', err.message);
    res.status(500).json({ message: 'Failed to upload image.' });
  }
};

// @desc Verify user token
const verifyToken = async (req, res) => {
  try {
    // If the request reaches here, it means the token is valid
    // (because it passed through the authenticate middleware)
    res.status(200).json({
      valid: true,
      message: 'Token is valid',
      user: {
        id: req.user.id,
        role: req.user.role
      }
    });
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({
      valid: false,
      message: 'Invalid token'
    });
  }
};

module.exports = { getProfile, updateProfile, uploadProfileImage, verifyToken };
