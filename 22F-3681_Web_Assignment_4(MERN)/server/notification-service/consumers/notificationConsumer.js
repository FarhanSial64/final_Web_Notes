import { sendEmail } from '../utils/emailSender.js';
import { sendSMS } from '../utils/smsSender.js';

export const consumeNotifications = async (channel) => {
  channel.consume('notifications', async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      console.log('📨 Notification received:', data);

      try {
        if (data.type === 'email') {
          await sendEmail(data.payload);
        } else if (data.type === 'sms') {
          await sendSMS(data.payload);
        }
        channel.ack(msg);
      } catch (err) {
        console.error('❌ Error processing notification:', err.message);
        channel.nack(msg); // Optional: requeue failed message
      }
    }
  });
};
