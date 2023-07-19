'use strict';
require('dotenv/config');

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { Message } = require('./models/Message');
const leaveRoom = require('./utils/leaveRoom');
const { Room } = require('./models/Room');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());

const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('Hello world');
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

const CHAT_BOT = 'ChatBot';
let chatRoom = '';
let allUsers = [];

io.on('connection', async(socket) => {
  let rooms = await Room.findAll();

  socket.emit('rooms', {
    rooms,
  });

  socket.on('join_room', async(data) => {
    const { userName, room } = data;

    const isRoom = await Room.findOne({
      where: { title: room },
    });

    if (!isRoom) {
      Room.create({
        title: room,
      });
    }

    socket.join(room);

    const createdtime = Date.now();

    socket.to(room).emit('receive_message', {
      message: `${userName} has joined the chat room`,
      userName: CHAT_BOT,
      createdtime,
    });

    socket.emit('receive_message', {
      message: `Welcome ${userName}`,
      userName: CHAT_BOT,
      createdtime,
    });

    chatRoom = room;

    allUsers.push({
      id: socket.id,
      userName,
      room,
    });

    const chatRoomUsers = allUsers.filter((user) => user.room === room);

    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);

    const messages = await Message.findAll({
      where: { room },
    });

    socket.emit('last_messages', messages);
  });

  socket.on('send_message', (data) => {
    const { message, userName, room, createdtime } = data;

    io.in(room).emit('receive_message', data);

    Message.create({
      message,
      userName,
      room,
      createdtime,
    });
  });

  socket.on('leave_room', async(data) => {
    const { userName, room } = data;

    socket.leave(room);

    const createdtime = Date.now();

    allUsers = leaveRoom(socket.id, allUsers);

    socket.to(room).emit('chatroom_users', allUsers);
    rooms = await Room.findAll();

    socket.emit('rooms', {
      rooms,
    });

    socket.to(room).emit('receive_message', {
      userName: CHAT_BOT,
      message: `${userName} has left the chat`,
      createdtime,
    });
  });

  socket.on('disconnect', () => {
    const user = allUsers.find((person) => person.id === socket.id);

    if (!user) {
      return;
    }

    if (user.userName) {
      allUsers = leaveRoom(socket.id, allUsers);
      socket.to(chatRoom).emit('chatroom_users', allUsers);

      socket.to(chatRoom).emit('receive_message', {
        message: `${user.userName} has disconnected from the chat.`,
      });
    }
  });
});

server.listen(PORT, () => `Server is running on port ${PORT}`);
