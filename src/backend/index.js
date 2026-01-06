/* eslint-disable no-console */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let rooms = {};

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('createRoom', (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { name: roomId, messages: [] };
    }
    io.emit('roomList', Object.keys(rooms));
    console.log(`Sala criada: ${roomId}`);
  });

  socket.on('renameRoom', ({ oldId, newId }) => {
    if (rooms[oldId]) {
      rooms[newId] = { ...rooms[oldId], name: newId };
      delete rooms[oldId];
      io.emit('roomList', Object.keys(rooms));
      console.log(`Sala renomeada de ${oldId} para ${newId}`);
    }
  });

  socket.on('deleteRoom', (roomId) => {
    delete rooms[roomId];
    io.emit('roomList', Object.keys(rooms));
    console.log(`Sala deletada: ${roomId}`);
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    socket.emit('previousMessages', rooms[roomId]?.messages || []);
    console.log(`Usuário ${socket.id} entrou na sala: ${roomId}`);
  });

  socket.on('sendMessage', ({ roomId, author, text }) => {
    const time = new Date().toLocaleTimeString();
    const message = { author, time, text };

    if (!rooms[roomId]) {
      rooms[roomId] = { name: roomId, messages: [] };
    }
    rooms[roomId].messages.push(message);

    io.to(roomId).emit('newMessage', message);
    console.log(`Mensagem na sala ${roomId} de ${author}: ${text}`);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

server.listen(3001, () => console.log('Backend rodando na porta 3001'));
