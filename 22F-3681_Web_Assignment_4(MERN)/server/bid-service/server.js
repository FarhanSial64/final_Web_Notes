import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import bidRoutes from './src/routes/bidRoutes.js';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // your frontend URL
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/bids', bidRoutes);

// Error handler (optional)
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`✅ Bid-Service running on port ${PORT}`));
