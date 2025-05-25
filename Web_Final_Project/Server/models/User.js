// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: { type: String, unique: true },
  address: String,
  image: {
    type: String,
    default: '' // e.g., can be a URL like 'https://your-cdn.com/uploads/default.png'
  },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('User', UserSchema);
