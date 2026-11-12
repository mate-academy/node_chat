import { Room, Message } from '../models/index.js';

const chatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Set username
    socket.on('set_username', (username) => {
      socket.data.username = username;
    });

    // Join room
    socket.on('join_room', (roomId) => {
      if (socket.data.currentRoom) {
        socket.leave(String(socket.data.currentRoom));
      }

      socket.join(String(roomId));
      socket.data.currentRoom = roomId;
    });

    // Leave room
    socket.on('leave_room', (roomId) => {
      socket.leave(String(roomId));
      socket.data.currentRoom = null;
    });

    // Send message
    socket.on('send_message', async ({ roomId, text }) => {
      try {
        const username = socket.data.username;

        if (!username || !text?.trim()) return;

        const room = await Room.findByPk(roomId);

        if (!room) return;

        const message = await Message.create({
          roomId,
          author: username,
          text: text.trim(),
        });

        io.to(String(roomId)).emit(
          'receive_message',
          message
        );
      } catch (error) {
        console.error('Message error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export default chatSocket;
