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

    socket.on('rename_room', ({ oldName, newName }) => {
      if (!rooms[oldName] || !newName || rooms[newName]) {
        return;
      }

      rooms[newName] = rooms[oldName];
      delete rooms[oldName];

      const clients = io.sockets.adapter.rooms.get(oldName);

      if (clients) {
        clients.forEach((clientId) => {
          const clientSocket = io.sockets.sockets.get(clientId);

          if (clientSocket) {
            clientSocket.leave(oldName);
            clientSocket.join(newName);
          }
        });
      }

      console.log(`Room renamed: ${oldName} -> ${newName}`);

      io.emit('room_renamed', { oldName, newName });
    });

    socket.on('delete_room', (roomName) => {
      if (!rooms[roomName] || roomName === 'general') {
        return;
      }

      delete rooms[roomName];

      console.log(`Room ${roomName} deleted`);

      io.emit('room_deleted', roomName);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      delete users[socket.id];
    });
  });
}
