import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documents: [String], // URLs of uploaded docs
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: String, // optional reason for rejection
}, { timestamps: true });

export default mongoose.model('VerificationRequest', verificationRequestSchema);
