import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  proposal: String,
  bidAmount: Number,
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  counterOffer: { type: Number },
}, { timestamps: true });

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
