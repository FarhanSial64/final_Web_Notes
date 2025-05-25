import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js"; // Use .js extension
import authRoutes from "./src/routes/authRoutes.js"; // Use .js extension
import cors from 'cors';

dotenv.config(); // Load environment variables from .env file

const app = express();

// Connect to the database
connectDB();

// Middleware to parse incoming JSON requests
app.use(express.json());
app.use(cors());

// Define routes
app.use("/api/auth", authRoutes); // Auth routes for login, signup, etc.

// Set the port from the environment or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
