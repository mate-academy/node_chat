'use strict';

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Зберігання активних кімнат та повідомлень
const rooms = new Map();
const messages = new Map();

// Обробка підключення користувача
io.on('connection', (socket) => {
  // eslint-disable-next-line no-console
  console.log('Користувач підключився:', socket.id);

  // Обробка створення кімнати
  socket.on('createRoom', (roomName) => {
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Set());
      messages.set(roomName, []);
      socket.join(roomName);
      rooms.get(roomName).add(socket.id);
      io.emit('roomList', Array.from(rooms.keys()));
    }
  });

  // Обробка приєднання до кімнати
  socket.on('joinRoom', (roomName) => {
    if (rooms.has(roomName)) {
      socket.join(roomName);
      rooms.get(roomName).add(socket.id);
      // Відправляємо історію повідомлень новому користувачу
      socket.emit('messageHistory', messages.get(roomName));
    }
  });

  // Обробка повідомлень
  socket.on('sendMessage', (messageData) => {
    const { roomName, text, author, time } = messageData;

    if (rooms.has(roomName)) {
      const message = {
        text,
        author,
        time,
        room: roomName,
      };

      messages.get(roomName).push(message);
      io.to(roomName).emit('newMessage', message);
    }
  });

  // Обробка відключення
  socket.on('disconnect', () => {
    // eslint-disable-next-line no-console
    console.log('Користувач відключився:', socket.id);

    rooms.forEach((users, roomName) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);

        if (users.size === 0) {
          rooms.delete(roomName);
          messages.delete(roomName);
        }
      }
    });
    io.emit('roomList', Array.from(rooms.keys()));
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущено на порту ${PORT}`);
});
