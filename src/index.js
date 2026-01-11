'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {
  General: [],
};

io.on('connection', (socket) => {
  // eslint-disable-next-line no-console
  console.log('A user connected: ', socket.id);

  socket.emit('roomsList', Object.keys(rooms));

  socket.on('joinRoom', (roomName) => {
    const currentRooms = Array.from(socket.rooms);

    currentRooms.forEach((r) => {
      if (r !== socket.id) {
        socket.leave(r);
      }
    });

    socket.join(roomName);

    const history = rooms[roomName] || [];

    socket.emit('messageHistory', history);
  });

  socket.on('chatMessage', ({ room, author, text }) => {
    if (!rooms[room]) {
      // eslint-disable-next-line no-useless-return
      return;
    }

    const message = {
      author,
      text,
      time: new Date().toLocaleTimeString(),
    };

    rooms[room].push(message);

    io.to(room).emit('message', message);
  });

  socket.on('createRoom', (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = [];
      io.emit('roomsList', Object.keys(rooms));
    }
  });

  socket.on('deleteRoom', (roomName) => {
    if (rooms[roomName]) {
      delete rooms[roomName];
      io.emit('roomsList', Object.keys(rooms));
    }
  });

  socket.on('renameRoom', ({ oldName, newName }) => {
    if (rooms[oldName] && !rooms[newName]) {
      rooms[newName] = rooms[oldName];

      delete rooms[oldName];
      io.emit('roomsList', Object.keys(rooms));
    }
  });
});

const PORT = 3500;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Chat server running on http://localhost:${PORT}`);
});
