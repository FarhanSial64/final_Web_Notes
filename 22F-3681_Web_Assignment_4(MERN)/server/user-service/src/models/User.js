import mongoose from "mongoose";

const portfolioItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  link: String,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationLevel: {
      type: String,
      enum: ["basic", "verified", "premium"],
      default: "basic",
    },
    // Freelancer-only fields
    skills: [String],
    portfolio: [portfolioItemSchema],
    profileCompleted: {
      type: Number, // % completeness
      default: 0,
    },
    // Client-only fields (optional)
    preferences: {
      categories: [String],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
