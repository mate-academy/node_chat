'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Роздаємо статичні файли (наш клієнтський HTML/JS) з папки public
app.use(express.static(path.join(__dirname, '../public')));

// База даних у пам'яті (in-memory)
// Формат: { "RoomName": [ { author, text, time } ] }
const rooms = {
  General: [],
};

io.on('connection', (socket) => {
  // Відправляємо новому користувачу список існуючих кімнат
  socket.emit('rooms_list', Object.keys(rooms));

  // --- JOIN ROOM ---
  socket.on('join_room', (roomName) => {
    // Виходимо з усіх попередніх кімнат (щоб не дублювати повідомлення)
    Array.from(socket.rooms).forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }

    socket.join(roomName);
    // Відправляємо історію повідомлень цієї кімнати клієнту
    socket.emit('room_history', rooms[roomName]);
  });

  // --- SEND MESSAGE ---
  socket.on('send_message', ({ room, author, text }) => {
    if (!rooms[room]) {
      return;
    }

    const message = {
      author,
      text,
      time: new Date().toLocaleTimeString(),
    };

    rooms[room].push(message);
    // Відправляємо нове повідомлення всім у цій кімнаті
    io.to(room).emit('new_message', message);
  });

  // --- CREATE ROOM ---
  socket.on('create_room', (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = [];
      io.emit('rooms_list', Object.keys(rooms));
    }
  });

  // --- RENAME ROOM ---
  socket.on('rename_room', ({ oldName, newName }) => {
    if (rooms[oldName] && !rooms[newName]) {
      rooms[newName] = rooms[oldName];
      delete rooms[oldName];

      // Повідомляємо всіх про оновлення списку кімнат
      io.emit('rooms_list', Object.keys(rooms));
      // Просимо клієнтів, які були в старій кімнаті, перепідключитися
      io.emit('room_renamed', { oldName, newName });
    }
  });

  // --- DELETE ROOM ---
  socket.on('delete_room', (roomName) => {
    if (rooms[roomName]) {
      delete rooms[roomName];
      io.emit('rooms_list', Object.keys(rooms));
      io.emit('room_deleted', roomName);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Chat server is running on http://localhost:${PORT}`);
});
