// controllers/socketController.js
import Message from '../models/Message.js';

export const handleChatMessage = async (socket, io, messageData) => {
  const { senderId, receiverId, content } = messageData;

  // Save message to MongoDB
  const message = new Message({
    senderId,
    receiverId,
    content,
    read: false,
  });
  await message.save();

  // Emit message to the recipient
  io.to(receiverId).emit('receiveMessage', message);
};

export const joinRoom = (socket, userId) => {
  // Join a room identified by userId
  socket.join(userId);
};

export const leaveRoom = (socket, userId) => {
  // Leave the room when disconnecting
  socket.leave(userId);
};
