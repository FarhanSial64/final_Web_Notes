import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';

dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Parse JSON

// Routes
app.use('/api/analytics', analyticsRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('📊 Analytics Service is running');
});

// Error handling (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Analytics Service running on port ${PORT}`);
});
