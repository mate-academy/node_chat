import { Room, Message } from '../models/index.js';

const chatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Set username
    socket.on('set_username', (username) => {
      socket.data.username = username;
    });

    // Join room and load message history
    socket.on('join_room', async (roomId) => {
      try {
        const parsedRoomId = Number(roomId);

        if (!Number.isInteger(parsedRoomId) || parsedRoomId <= 0) {
          return;
        }

        const room = await Room.findByPk(parsedRoomId);

        if (!room) {
          return;
        }

        if (socket.data.currentRoom) {
          socket.leave(String(socket.data.currentRoom));
        }

        socket.join(String(parsedRoomId));
        socket.data.currentRoom = parsedRoomId;

        const messages = await Message.findAll({
          where: { roomId: parsedRoomId },
          order: [['createdAt', 'ASC']],
        });

        socket.emit('room_history', messages);
      } catch (error) {
        console.error('Join room error:', error);
      }
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

        if (!username || !text?.trim()) {
          return;
        }

        const room = await Room.findByPk(roomId);

        if (!room) {
          return;
        }

        const message = await Message.create({
          roomId,
          author: username,
          text: text.trim(),
        });

        io.to(String(roomId)).emit('receive_message', message);
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
