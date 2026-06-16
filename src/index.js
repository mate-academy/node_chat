'use strict';

require('dotenv').config();

const Room = require('./models/Room');
const Message = require('./models/Message');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  process.stdout.write(`New client connected: ${socket.id}\n`);

  socket.on('getRooms', async () => {
    const rooms = await Room.find();

    socket.emit('roomsList', rooms);
  });

  socket.on('createRoom', async (name) => {
    await Room.create({ name });

    const rooms = await Room.find();

    io.emit('roomsList', rooms);
  });

  socket.on('sendMessage', async ({ roomId, author, text }) => {
    const message = await Message.create({ room: roomId, author, text });

    io.to(roomId).emit('newMessage', message);
  });

  socket.on('renameRoom', async ({ roomId, name }) => {
    await Room.findByIdAndUpdate(roomId, { name });

    const rooms = await Room.find();

    io.emit('roomsList', rooms);
  });

  socket.on('deleteRoom', async (roomId) => {
    await Room.findByIdAndDelete(roomId);
    await Message.deleteMany({ room: roomId });

    const rooms = await Room.find();

    io.emit('roomsList', rooms);
  });

  socket.on('joinRoom', async (roomId) => {
    socket.join(roomId);

    const messages = await Message.find({ room: roomId }).sort({ time: 1 });

    socket.emit('roomHistory', messages);
  });

  socket.on('disconnect', () => {
    process.stdout.write(`Client disconnected: ${socket.id}\n`);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  process.stdout.write(`Server running on port ${PORT}\n`);
});
