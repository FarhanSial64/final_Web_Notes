const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Signup Controller
exports.signup = async (req, res) => {
    try {
        const { username, email, password, role, firstName, lastName, location, qualifications, hourlyRate, teachingPreferences } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
            firstName,
            lastName,
            location,  
            qualifications: role === 'tutor' ? qualifications : undefined,
            hourlyRate: role === 'tutor' ? hourlyRate : undefined,
            teachingPreferences: role === 'tutor' ? teachingPreferences : undefined,
            verificationStatus: role === 'tutor' ? 'pending' : undefined, 
            verificationComments: role === 'tutor' ? 'Pending verification' : undefined,
            subjects: role === 'tutor' ? ['Mathematics', 'Physics', 'Chemistry'] : undefined, // Initialize subjects for tutors
        });

        // Save user to database
        await newUser.save();

        // Send a success response
        res.status(201).json({
            success: true,
            message: 'User created successfully! Redirecting to login page...',
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ success: false, message: 'Signup failed', error: error.message });
    }
};

// Login Controller
exports.login = async (req, res) => {
  try {
      const { identifier, password } = req.body; // Can be email or username

      // Find user by email or username
      const user = await User.findOne({
          $or: [{ email: identifier }, { username: identifier }]
      });

      if (!user) {
          return res.status(401).json({ message: 'Invalid username or email' });
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          return res.status(401).json({ message: 'Incorrect password' });
      }

      // Generate token
      const token = generateToken(user._id, user.role);

      res.status(200).json({
          success: true,
          message: `Welcome, ${user.firstName}! Redirecting to your dashboard...`,
          token,
          user: {
              _id: user._id,
              username: user.username,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              location: user.location,
              subjects: user.subjects,
              hourlyRate: user.hourlyRate,
              availability: user.availability,
              teachingPreferences: user.teachingPreferences,
              qualifications: user.qualifications,
          },
      });
  } catch (error) {
      console.error('❌ Login Error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
  }
};
