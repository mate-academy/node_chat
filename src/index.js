'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Data structures
// rooms: { roomName: { messages: [ { author, text, time } ] } }
const rooms = {
  General: { messages: [] },
};

io.on('connection', (socket) => {
  // New client connected

  // Send initial room list
  socket.emit('updateRooms', Object.keys(rooms));

  socket.on('login', (username) => {
    socket.username = username;
  });

  socket.on('createRoom', (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = { messages: [] };
      io.emit('updateRooms', Object.keys(rooms));
    }
  });

  socket.on('joinRoom', (roomName) => {
    if (rooms[roomName]) {
      // Leave previous rooms
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      socket.join(roomName);
      socket.emit('roomHistory', rooms[roomName].messages);
    }
  });

  socket.on('sendMessage', (data) => {
    const { room, text, author } = data;

    if (rooms[room]) {
      const message = {
        author,
        text,
        time: Date.now(),
      };

      rooms[room].messages.push(message);
      io.to(room).emit('message', message);
    }
  });

  socket.on('deleteRoom', (roomName) => {
    if (rooms[roomName]) {
      delete rooms[roomName];
      io.emit('updateRooms', Object.keys(rooms));
      io.to(roomName).emit('roomDeleted', roomName);

      io.in(roomName).socketsLeave(roomName);
    }
  });

  socket.on('renameRoom', (data) => {
    const { oldName, newName } = data;

    if (rooms[oldName] && !rooms[newName]) {
      rooms[newName] = rooms[oldName];
      delete rooms[oldName];
      io.emit('updateRooms', Object.keys(rooms));
      io.to(oldName).emit('roomDeleted', oldName);
    }
  });

  socket.on('disconnect', () => {
    // Client disconnected
  });
});

server.listen(PORT, () => {});
