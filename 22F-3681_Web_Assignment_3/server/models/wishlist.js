const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique:true },
    tutorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model("Wishlist", wishlistSchema);