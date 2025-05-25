const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  seatsAvailable: { type: Number, required: true },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  days: [{ type: String }],  // Changed from "day" to "days" (an array)
  startTime: { type: String },
  endTime: { type: String },
  department: { type: String, required: true },
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }] // 🔹 Stores enrolled students
});

// ✅ Prevent Overwriting
module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);

