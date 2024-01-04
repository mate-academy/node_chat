import type { Socket } from 'socket.io';
import Chat from '../models/chat';

export default function(socket: Socket) {
  socket.on('message', async({ sender, message, room }) => {
    try {
      const chat = new Chat({
        sender,
        message,
        room,
      });

      await chat.save();

      if (room) {
        socket.to(room).emit('message', chat);
      } else {
        // send the message to all connected clients
        socket.broadcast.emit('message', chat);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  });

  socket.on('join room', (room) => {
    socket.join(room);
  });
};
