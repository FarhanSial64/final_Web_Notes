import { sendEmail } from '../utils/emailSender.js';
import { sendSMS } from '../utils/smsSender.js';
import { connectRabbitMQ, consumeMessages } from '../config/rabbitmq.js';

export const initNotificationConsumer = async () => {
  await connectRabbitMQ();
  await consumeMessages(async ({ type, payload }) => {
    if (type === 'email') {
      await sendEmail(payload);
    } else if (type === 'sms') {
      await sendSMS(payload);
    }
  });
};

export const sendNotification = async (req, res) => {
  try {
    const { type, payload } = req.body;

    if (type === 'email') await sendEmail(payload);
    else if (type === 'sms') await sendSMS(payload);
    else return res.status(400).json({ message: 'Invalid notification type' });

    res.json({ message: 'Notification sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending notification', error: err.message });
  }
};
