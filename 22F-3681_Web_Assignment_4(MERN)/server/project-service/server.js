import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import projectRoutes from './src/routes/projectRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // your frontend URL
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('🛠️ Project Service is running...');
});

// Connect to DB and Start Server
const PORT = process.env.PORT || 5005;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Project Service running on port ${PORT}`);
  });
});
