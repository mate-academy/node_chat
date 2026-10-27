/* eslint-disable no-console */
'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3005;
const ROOT = path.join(__dirname, '..');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use(cors());

app.use('/src', express.static(path.join(ROOT, 'src')));
app.use('/public', express.static(path.join(ROOT, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

const rooms = {
  general: { messages: [] },
  room1: { messages: [] },
};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('roomsList', Object.keys(rooms));

  socket.on('message', (data) => {
    if (!data || !rooms[data.room]) {
      return;
    }

    const message = {
      userName: data.userName,
      text: data.text,
      time: new Date().toTimeString().split(' ')[0],
      room: data.room,
    };

    rooms[data.room].messages.push(message);
    io.to(data.room).emit('message', message);
  });

  socket.on('joinRoom', (roomName) => {
    if (!rooms[roomName]) {
      return;
    }

    socket.rooms.forEach((joined) => {
      if (joined !== socket.id) {
        socket.leave(joined);
      }
    });

    socket.join(roomName);
    socket.emit('roomMessages', rooms[roomName].messages);
  });

  socket.on('createRoom', (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = { messages: [] };
      io.emit('roomsList', Object.keys(rooms));
    }
  });

  socket.on('renameRoom', ({ oldName, newName }) => {
    if (rooms[oldName] && !rooms[newName]) {
      rooms[newName] = rooms[oldName];
      delete rooms[oldName];

      io.in(oldName).socketsJoin(newName);
      io.in(oldName).socketsLeave(oldName);

      io.emit('roomRenamed', { oldName, newName });
      io.emit('roomsList', Object.keys(rooms));
    }
  });

  socket.on('deleteRoom', (roomName) => {
    if (roomName !== 'general' && rooms[roomName]) {
      delete rooms[roomName];
      io.in(roomName).socketsLeave(roomName);
      io.emit('roomsList', Object.keys(rooms));
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
