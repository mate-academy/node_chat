import { messageService } from './services/message.service.js';

export const messageServer = (io) => {
  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log('Новий користувач підключився:', socket.id);

    socket.on('joinRoom', ({ roomId }) => {
      socket.join(`room_${roomId}`);
    });

    socket.on('newMessage', async ({ roomId, userId, text }) => {
      try {
        const message = await messageService.createMessage({
          roomId,
          userId,
          text,
        });

        io.to(`room_${roomId}`).emit('messageBroadcast', message);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error in newMessage handler:', err);
      }
    });

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log('Користувач відключився:', socket.id);
    });
  });
};
