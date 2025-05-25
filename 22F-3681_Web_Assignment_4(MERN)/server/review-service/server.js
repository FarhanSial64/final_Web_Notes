// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import reviewRoutes from './src/routes/reviewRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`✅ Review Service running on port ${PORT}`));
