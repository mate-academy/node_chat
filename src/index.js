'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, 'public');

const rooms = new Map();
const DEFAULT_ROOM = 'general';

rooms.set(DEFAULT_ROOM, {
  id: DEFAULT_ROOM,
  name: 'General',
  messages: [],
});

function createRoom(id, roomName) {
  const room = { id, name: roomName, messages: [] };

  rooms.set(id, room);

  return room;
}

function getRoomsData() {
  return Array.from(rooms.values()).map((room) => ({
    id: room.id,
    name: room.name,
  }));
}

const server = http.createServer((req, res) => {
  const filePath = path.join(
    PUBLIC_DIR,
    req.url === '/' ? 'index.html' : req.url,
  );

  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.jsx': 'application/javascript',
    '.css': 'text/css',
  };

  const contentType = contentTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');

      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const io = new Server(server);

io.on('connection', (socket) => {
  let currentRoom = null;
  let username = null;

  socket.emit('rooms:list', getRoomsData());

  socket.on('user:set', (userName) => {
    username = userName;
  });

  socket.on('room:join', (roomId) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', `Room "${roomId}" does not exist`);

      return;
    }

    if (currentRoom) {
      socket.leave(currentRoom);
    }

    currentRoom = roomId;
    socket.join(roomId);

    const room = rooms.get(roomId);

    socket.emit('room:history', { roomId, messages: room.messages });
  });

  socket.on('room:create', ({ id, name: roomName }) => {
    if (rooms.has(id)) {
      socket.emit('error', `Room "${id}" already exists`);

      return;
    }

    const room = createRoom(id, roomName);

    io.emit('rooms:list', getRoomsData());
    socket.emit('room:created', { id: room.id, name: room.name });
  });

  socket.on('room:rename', ({ id, name: newName }) => {
    if (!rooms.has(id)) {
      socket.emit('error', `Room "${id}" does not exist`);

      return;
    }

    rooms.get(id).name = newName;
    io.emit('rooms:list', getRoomsData());
  });

  socket.on('room:delete', (id) => {
    if (id === DEFAULT_ROOM) {
      socket.emit('error', 'Cannot delete the default room');

      return;
    }

    if (!rooms.has(id)) {
      socket.emit('error', `Room "${id}" does not exist`);

      return;
    }

    rooms.delete(id);
    io.emit('rooms:list', getRoomsData());
    io.to(id).emit('room:deleted', id);
  });

  socket.on('message:send', ({ roomId, text }) => {
    if (!rooms.has(roomId)) {
      return;
    }

    const message = {
      id: Date.now() + Math.random().toString(36).slice(2),
      author: username || 'Anonymous',
      text,
      time: new Date().toISOString(),
    };

    rooms.get(roomId).messages.push(message);
    io.to(roomId).emit('message:new', { roomId, message });
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Chat server running at http://localhost:${PORT}`);
});
