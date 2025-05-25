import amqp from 'amqplib';

let channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue('notificationQueue');
  console.log('✅ Connected to RabbitMQ');
};

export const consumeMessages = async (handleMessage) => {
  await channel.consume('notificationQueue', async (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      await handleMessage(content);
      channel.ack(msg);
    }
  });
};
