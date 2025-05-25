// portfolioItem.js
import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  link: String,
});

export default portfolioItemSchema; // ✅ exporting the SCHEMA, not a model
