import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import portfolioItemSchema from "./portfolioItem.js";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["freelancer", "client", "admin"], required: true },
    isVerified: { type: Boolean, default: false },
    verificationLevel: { type: String, enum: ["basic", "verified", "premium"], default: "basic" },
  
    // Freelancer Fields
    skills: [String],
    portfolio: [portfolioItemSchema],
    profileCompleted: { type: Number, default: 0 },
  
    // Client Fields
    preferences: {
      categories: [String]
    },
  
    createdAt: Date,
    updatedAt: Date
  }
);  

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
