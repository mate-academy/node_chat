'use strict';

require('dotenv/config');

const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use(express.json());

const rooms = {
  general: { id: 'general', name: 'general room', messages: [] },
};

const server = app.listen(PORT);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_HOST],
  },
});

// conectou ao servidor
io.on('connection', (socket) => {
  socket.emit('update_rooms', Object.values(rooms));

  // entrou na sala
  socket.on('join_room', (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      socket.emit('room_history', rooms[roomId].messages);
    }
  });

  // criar sala
  socket.on('create_room', (roomName) => {
    const roomId = roomName.toLowerCase();

    if (!rooms[roomId]) {
      rooms[roomId] = { id: roomId, name: roomName, messages: [] };
      io.emit('update_rooms', Object.values(rooms));
    }
  });

  socket.on('edit_room', ({ roomId, newName }) => {
    if (rooms[roomId]) {
      rooms[roomId].name = newName;
      io.emit('update_rooms', Object.values(rooms));
    }
  });

  socket.on('delete_room', (roomId) => {
    if (rooms[roomId]) {
      delete rooms[roomId];
      io.to(roomId).emit('room_deleted');
      io.emit('update_rooms', Object.values(rooms));
    }
  });

  socket.on('send_message', (data) => {
    const { room, message, author } = data;

    if (rooms[room]) {
      const timeFormated = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newMessage = {
        author,
        message,
        timeStamp: Date.now(),
        time: timeFormated,
      };

      rooms[room].messages.push(newMessage);
      io.to(room).emit('receive_message', newMessage);
    }
  });
});
