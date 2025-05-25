import mongoose from 'mongoose';

const adminActionLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: String,
  targetType: String, // 'User', 'Project', etc.
  targetId: mongoose.Schema.Types.ObjectId,
  note: String
}, { timestamps: true });

export default mongoose.model('AdminActionLog', adminActionLogSchema);
