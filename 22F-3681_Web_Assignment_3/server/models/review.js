const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    reviewText: { type: String },
    date: { type: Date, default: Date.now },
    sessionId: {type: mongoose.Schema.Types.ObjectId,ref:'Session', required: true}
});

module.exports = mongoose.model("Review", reviewSchema);