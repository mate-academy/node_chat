'use strict';

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

let rooms = [];
let messages = [];

app.get('/', (req, res) => {
  res.send('Server works');
});

io.on('connection', (socket) => {
  socket.emit('update_rooms', rooms);

  socket.on('create', (room) => {
    rooms.push(room);
    io.emit('update_rooms', rooms);
  })

  socket.on('rename', (id, newName) => {
    let room = rooms.find(room => room.id === id);

    if (room) {
      room.name = newName;
      io.emit('update_rooms', rooms);
    }
  })

  socket.on('delete', (id) => {
    rooms = rooms.filter(room => room.id !== id);
    messages = messages.filter(message => message.roomId !== id)

    io.emit('update_rooms', rooms);
  })

  socket.on('send_message', (newMessage) => {
    messages.push(newMessage);

    io.to(newMessage.roomId).emit('receive_message', newMessage);
  });

  socket.on('join', (id) => {
    socket.join(id);
    const roomHistory = messages.filter(m => m.roomId === id)
      socket.emit('room_history', roomHistory)
  })

  socket.on('disconnect', () => {
    return;
  });
});

const start = async (req, res) => {
  try {
    server.listen(PORT, () => {
      console.log(`🚀 Сервер успішно запущено на порту ${PORT}`);
    })
  } catch (error) {
    console.error('❌ Помилка при запуску сервера:', error);
  }
}

start();
