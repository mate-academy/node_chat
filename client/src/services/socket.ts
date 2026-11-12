import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const setUsername = (username: string) => {
  socket.emit('set_username', username);
};

export const sendMessage = (roomId: number, text: string) => {
  socket.emit('send_message', {
    roomId,
    text,
  });
};
