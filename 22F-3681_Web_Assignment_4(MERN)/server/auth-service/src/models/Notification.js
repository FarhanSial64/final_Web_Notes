import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['system', 'verification', 'project', 'bid', 'message'],
      required: true,
    },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    sendEmail: { type: Boolean, default: false },
    sendSMS: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
