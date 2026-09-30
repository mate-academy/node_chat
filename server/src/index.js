'use strict';

const express = require('express');
const http = require('http');
// const cors = require('cors');
const { Server } = require('socket.io');

const PORT = 3000;
const CLIENT_URL = 'http://localhost:5173';

const app = express();

// app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_URL } });

let nextMessageId = 1;
let nextRoomId = 1;
const DEFAULT_ROOM_ID = '1';
const rooms = {};

function createRoom(name) {
  const id = String(nextRoomId++);

  rooms[id] = { id, name, messages: [] };

  return rooms[id];
}
createRoom('general');

const roomList = () =>
  Object.values(rooms).map((room) => ({ id: room.id, name: room.name }));

const clean = (value, max) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

io.on('connection', (socket) => {
  socket.on('login', (username) => {
    const name = clean(username, 24);

    if (!name) {
      return;
    }

    socket.data.username = name;
    socket.emit('rooms:list', roomList());
  });

  socket.on('room:join', (id) => {
    const room = rooms[id];

    if (!room || !socket.data.username) {
      return;
    }

    if (socket.data.roomId) {
      socket.leave(socket.data.roomId);
    }

    socket.join(id);
    socket.data.roomId = id;

    socket.emit('room:history', {
      room: { id: room.id, name: room.name },
      messages: room.messages,
    });
  });

  socket.on('message:send', (text) => {
    const room = rooms[socket.data.roomId];
    const body = clean(text, 2000);

    if (!room || !body || !socket.data.username) {
      return;
    }

    const msg = {
      id: nextMessageId++,
      author: socket.data.username,
      time: Date.now(),
      text: body,
    };

    room.messages.push(msg);
    io.to(room.id).emit('message:new', msg);
  });

  socket.on('room:create', (name) => {
    const title = clean(name, 32);

    if (!title) {
      return;
    }

    createRoom(title);
    io.emit('rooms:list', roomList());
  });

  socket.on('room:rename', ({ id, name } = {}) => {
    const title = clean(name, 32);

    if (!rooms[id] || !title) {
      return;
    }

    rooms[id].name = title;
    io.emit('rooms:list', roomList());
  });

  socket.on('room:delete', (id) => {
    if (!rooms[id] || id === DEFAULT_ROOM_ID) {
      return;
    }

    io.to(id).emit('room:deleted', id);
    io.in(id).socketsLeave(id);

    delete rooms[id];

    io.emit('rooms:list', roomList());
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${PORT}`);
});
