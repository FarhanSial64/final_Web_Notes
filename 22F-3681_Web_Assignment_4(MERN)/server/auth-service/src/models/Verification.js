import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  documentType: String,
  documentUrl: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  adminComment: String,
  submittedAt: Date,
  reviewedAt: Date
});

const Verification = mongoose.model("Verification", verificationSchema);
export default Verification;
