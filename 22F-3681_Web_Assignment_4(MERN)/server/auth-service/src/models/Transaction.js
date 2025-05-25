import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["payment", "payout"] },
  amount: Number,
  date: Date,
  description: String
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
