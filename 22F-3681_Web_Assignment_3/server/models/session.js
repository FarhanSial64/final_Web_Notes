const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true }, // In hours
  sessionType: { 
    type: String, 
    enum: ["online", "in-person"], 
    required: true 
  }, // Specifies the session mode
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "completed"],
    default: "pending",
  },
  earnings: { type: Number, required: true }, // Based on tutor's hourly rate
  paymentStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.models.Session || mongoose.model("Session", sessionSchema);
