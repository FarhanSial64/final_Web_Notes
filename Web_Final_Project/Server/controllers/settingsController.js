const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

/**
 * Change admin password
 * @route POST /admin/settings/change-password
 * @access Private (Admin only)
 */
exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find the admin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Reset user password (send reset email)
 * @route POST /admin/settings/reset-user-password/:userId
 * @access Private (Admin only)
 */
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token (valid for 15 minutes)
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Reset Your Password',
      html: `
        <p>Hello ${user.name || ''},</p>
        <p>An administrator has requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link is valid for 15 minutes.</p>
        <p>If you did not request this reset, please contact support.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent to user\'s email' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Generate a random password
 * @route POST /admin/settings/generate-password/:userId
 * @access Private (Admin only)
 */
exports.generateRandomPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-8);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your New Password',
      html: `
        <p>Hello ${user.name || ''},</p>
        <p>An administrator has reset your password.</p>
        <p>Your new password is: <strong>${randomPassword}</strong></p>
        <p>Please log in with this password and change it immediately for security reasons.</p>
        <a href="http://localhost:3000/login" style="padding: 10px 15px; background-color: #3f51b5; color: white; border-radius: 5px; text-decoration: none;">Login Now</a>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'New password generated and sent to user\'s email' });
  } catch (error) {
    console.error('Error generating random password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
