import { io } from 'socket.io-client';

export const socket = io({
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
