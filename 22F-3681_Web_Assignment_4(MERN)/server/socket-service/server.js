// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import http from 'http';
import { setupSocket } from './src/socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Socket.IO
setupSocket(server);

// Start Express Server
const PORT = process.env.PORT || 5008;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
