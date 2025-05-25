import express from 'express';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notificationRoutes.js';
import { initNotificationConsumer } from './controllers/notificationController.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5007;
app.listen(PORT, () => {
  console.log(`🚀 Notification Service running on port ${PORT}`);
  initNotificationConsumer();
});
