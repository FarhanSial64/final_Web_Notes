import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js"; // Mock email sender
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken'; // ES module style


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const signup = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // Check if user already exists (email or phone)
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  try {
    const newUser = new User({
      name,
      email,
      phone,
      password,
      role,
    });

    await newUser.save();

    // Send verification email (or SMS for phone)
    const verificationLink = `http://localhost:5000/api/auth/verify/${newUser._id}`;
    sendEmail(newUser.email, "Verify your account", `Click here to verify your Account: ${verificationLink}`);

    res.status(201).json({
      message: "User created successfully, please verify your account",
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  // ✅ Verify reCAPTCHA
  try {
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
      return res.status(400).json({ 
        message: 'Failed reCAPTCHA verification',
        errors: recaptchaResponse.data['error-codes'] 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error verifying reCAPTCHA',
      error: error.message 
    });
  }

  // Rest of your login logic
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  if (!user.isVerified) {
    return res.status(400).json({ message: "Please verify your account" });
  }

  const token = generateToken(user);
  console.log(token);
  console.log("Found User:", user);
  res.json({
    message: "Login successful",
    token,
    user,
  });
};

export const verifyAccount = async (req, res) => {
  const { userId } = req.params;

  // Find the user by ID and verify their account
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isVerified = true;
  user.verificationLevel = "basic";
  await user.save();

  res.json({ message: "Account verified successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  // Send password reset link
  const resetLink = `http://localhost:3000/reset-password/${token}`;
  sendEmail(user.email, "Password Reset", `Click here to reset your password: ${resetLink}`);

  res.json({ message: "Password reset link sent to your email" });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ email: decoded.email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!newPassword) {
          return res.status(400).json({ message: 'Password is required' });
        }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      // Hash and update the new password
      user.password = newPassword;
      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }

 
};

export const googleAuth = async (req, res) => {
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
    const { email, name} = payload;

    let user = await User.findOne({ email });

    // If user doesn't exist, create one
    if (!user) {
      user = await User.create({
        name,
        email,
        password: '', // No password for Google user
        isGoogleUser: true,
        role: "client",
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

      await sendEmail(email, 'Welcome to Skill Swap!', htmlContent);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email},
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};