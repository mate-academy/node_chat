'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

const rooms = new Map();

io.on('connection', (socket) => {
  socket.on('join-room', (data) => {
    const { username, roomName } = data;

    if (!rooms.has(roomName)) {
      rooms.set(roomName, {
        name: roomName,
        messages: [],
        users: new Set(),
      });
    }

    const room = rooms.get(roomName);

    room.users.add(username);

    socket.join(roomName);
    socket.username = username;
    socket.currentRoom = roomName;

    socket.emit('room-history', room.messages);
    socket.to(roomName).emit('user-joined', { username, roomName });
  });

  socket.on('send-message', (data) => {
    const { message, roomName, username } = data;
    const timestamp = new Date().toISOString();

    const messageData = {
      id: Date.now(),
      username,
      message,
      timestamp,
      roomName,
    };

    if (rooms.has(roomName)) {
      rooms.get(roomName).messages.push(messageData);
    }

    io.to(roomName).emit('new-message', messageData);
  });

  socket.on('create-room', (data) => {
    const { roomName } = data;

    if (!rooms.has(roomName)) {
      rooms.set(roomName, {
        name: roomName,
        messages: [],
        users: new Set(),
      });
      socket.emit('room-created', { roomName });
    } else {
      socket.emit('room-error', { message: 'Room already exists' });
    }
  });

  socket.on('get-rooms', () => {
    const roomList = Array.from(rooms.keys());

    socket.emit('rooms-list', roomList);
  });

  socket.on('delete-room', (data) => {
    const { roomName } = data;

    if (rooms.has(roomName)) {
      io.to(roomName).emit('room-deleted', { roomName });
      rooms.delete(roomName);
    }
  });

  socket.on('rename-room', (data) => {
    const { oldName, newName } = data;

    if (rooms.has(oldName) && !rooms.has(newName)) {
      const roomData = rooms.get(oldName);

      roomData.name = newName;
      rooms.set(newName, roomData);
      rooms.delete(oldName);

      io.to(oldName).emit('room-renamed', { oldName, newName });
    } else {
      socket.emit('room-error', { message: 'Room rename failed' });
    }
  });

  socket.on('disconnect', () => {
    if (socket.username && socket.currentRoom) {
      const room = rooms.get(socket.currentRoom);

      if (room) {
        room.users.delete(socket.username);

        socket.to(socket.currentRoom).emit('user-left', {
          username: socket.username,
          roomName: socket.currentRoom,
        });
      }
    }
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
