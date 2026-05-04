/* eslint-disable no-console */
import { users } from '../state/users.js';
import { rooms } from '../state/rooms.js';

export function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.join('general');

    socket.on('set_username', (username) => {
      if (!username) {
        return;
      }

      users[socket.id] = username;
      console.log('Username set:', username);
    });

    socket.on('create_room', (roomName) => {
      if (!roomName) {
        return;
      }

      if (!rooms[roomName]) {
        rooms[roomName] = {
          messages: [],
        };
      }

      console.log('Room created:', roomName);

      io.emit('room_created', roomName);
    });

    socket.on('join_room', (roomName) => {
      if (!roomName) {
        return;
      }

      if (!rooms[roomName]) {
        rooms[roomName] = {
          messages: [],
        };
      }

      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      socket.join(roomName);

      console.log('User joined room:', roomName);

      socket.emit('room_history', rooms[roomName].messages);
    });

    socket.on('message', (data) => {
      const room = data.room || 'general';

      if (!rooms[room]) {
        return;
      }

      const message = {
        text: data.text,
        author: data.author,
        time: data.time,
      };

      rooms[room].messages.push(message);

      io.to(room).emit('message', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      delete users[socket.id];
    });
  });
}
