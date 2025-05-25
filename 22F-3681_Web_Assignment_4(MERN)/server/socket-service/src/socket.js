// socket.js
import { Server } from 'socket.io';
import { handleChatMessage, joinRoom, leaveRoom } from './controllers/socketController.js';

export const setupSocket = (server) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for join room event
    socket.on('join', (userId) => {
      joinRoom(socket, userId);
      console.log(`User ${userId} joined room`);
    });

    // Listen for chat message event
    socket.on('sendMessage', (messageData) => {
      handleChatMessage(socket, io, messageData);
    });

    // Listen for disconnect event
    socket.on('disconnect', () => {
      console.log('A user disconnected');
      // Clean up after disconnect
      eaveRoom(socket, userId);  // Optional: if you are storing rooms
    });
  });

  return io;
};
