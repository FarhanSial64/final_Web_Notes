const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

// Connect to Database
connectDB();

// Middleware Setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cancelOrderRoute = require('./routes/cancelOrderRoute'); // New route for order cancellation
const wishlistRoutes = require('./routes/wishlistRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoute = require('./routes/upload');
const userRoute = require('./routes/userRoutes');
const emailRoutes = require('./routes/emailRoute');





// Routes Setup
app.use('/auth', authRoutes);             // Login / Signup
app.use('/products', productRoutes);      // View Products
app.use('/cart', cartRoutes);             // Cart operations
app.use('/orders', orderRoutes);          // Place / Track Orders
app.use('/cancel-order', cancelOrderRoute); // Order cancellation (new route)
app.use('/wishlist', wishlistRoutes);     // Wishlist actions
app.use('/user', userRoutes);             // Customer profile management
app.use('/admin', adminRoutes);           // Admin operations
app.use('/upload', uploadRoute);          // Image Upload
app.use('/user', userRoute);              // User profile management
app.use('/email', emailRoutes);           // Email sending route

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
