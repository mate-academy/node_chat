'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));

const rooms = {
  general: {
    messages: [],
    users: [],
  },
};

io.on('connection', (socket) => {
  let username = 'Anonymous';
  let currentRoom = 'general';

  socket.join(currentRoom);

  socket.emit('rooms', Object.keys(rooms));
  socket.emit('history', rooms[currentRoom].messages);
  io.to(currentRoom).emit('users', rooms[currentRoom].users);

  socket.on('setUsername', (name) => {
    username = name;

    if (!rooms[currentRoom].users.includes(username)) {
      rooms[currentRoom].users.push(username);
    }

    io.to(currentRoom).emit('users', rooms[currentRoom].users);
  });

  socket.on('createRoom', (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = {
        messages: [],
        users: [],
      };

      io.emit('rooms', Object.keys(rooms));
    }
  });

  socket.on('renameRoom', ({ oldName, newName }) => {
    if (!rooms[oldName] || rooms[newName]) return;

    rooms[newName] = rooms[oldName];
    delete rooms[oldName];

    io.sockets.sockets.forEach((s) => {
      if (s.rooms.has(oldName)) {
        s.leave(oldName);
        s.join(newName);

        if (s === socket) {
          currentRoom = newName;
        }
      }
    });

    io.emit('rooms', Object.keys(rooms));
  });

  socket.on('deleteRoom', (roomName) => {
    if (roomName === 'general') return;
    if (!rooms[roomName]) return;

    io.sockets.sockets.forEach((s) => {
      if (s.rooms.has(roomName)) {
        s.leave(roomName);
        s.join('general');
      }
    });

    delete rooms[roomName];

    io.emit('rooms', Object.keys(rooms));
  });

  socket.on('joinRoom', (roomName) => {
    if (!rooms[roomName]) return;

    socket.leave(currentRoom);

    rooms[currentRoom].users =
      rooms[currentRoom].users.filter((user) => user !== username);

    io.to(currentRoom).emit('users', rooms[currentRoom].users);

    currentRoom = roomName;

    socket.join(currentRoom);

    if (!rooms[currentRoom].users.includes(username)) {
      rooms[currentRoom].users.push(username);
    }

    socket.emit('history', rooms[currentRoom].messages);
    io.to(currentRoom).emit('users', rooms[currentRoom].users);
  });

  socket.on('message', (data) => {
    const message = {
      author: username,
      text: data.text,
      time: new Date().toLocaleTimeString(),
    };

    rooms[currentRoom].messages.push(message);

    io.to(currentRoom).emit('message', message);
  });

  socket.on('disconnect', () => {
    rooms[currentRoom].users =
      rooms[currentRoom].users.filter((user) => user !== username);

    io.to(currentRoom).emit('users', rooms[currentRoom].users);
  });
});

server.listen(PORT);