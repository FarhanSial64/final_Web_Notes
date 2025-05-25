const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();

const { protect, authorize } = require('./middleware/authMiddleware');
const app = express();
const authRoutes = require('./routes/auth');
const adminRoutes = require("./routes/tutorVerify");
const reportRoutes = require("./routes/reportRoutes");
const tutorRoutes = require("./routes/tutorRoute");
const sessionRoutes = require("./routes/sessionRoutes");

// Middleware
app.use(cors());
app.use(express.json()); // ✅ Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
// Connect Database
connectDB();


app.use('/auth', authRoutes);
app.use("/api/admin/tutors", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/sessions", sessionRoutes);

// Example protected routes with role-based authorization:
app.get('/student-dashboard', protect, authorize('student'), (req, res) => {
  res.json({ message: 'Student Dashboard', user: req.user });
});

app.get('/tutor-dashboard', protect, authorize('tutor'), (req, res) => {
  res.json({ message: 'Tutor Dashboard', user: req.user });
});

app.get('/admin-dashboard', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin Dashboard', user: req.user });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});