import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const sendMessage = (roomId: number, text: string) => {
  socket.emit('send_message', {
    roomId,
    text,
  });
};
