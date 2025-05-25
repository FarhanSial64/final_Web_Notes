import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import userRoutes from './src/routes/userRoutes.js';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
// Routes
app.use('/api/users', userRoutes);

// Health check or base route
app.get('/', (req, res) => {
  res.send('👤 User Service is running...');
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`🚀 User Service running on http://localhost:${PORT}`);
});
