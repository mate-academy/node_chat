const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }),
);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const users = {};
const roomMessages = {};

io.on('connection', (socket) => {
  users[socket.id] = 'guest';

  socket.on('set-username', (username) => {
    users[socket.id] = username;
  });

  socket.on('get-rooms', async () => {
    const roomSummaries = [];

    for (const [roomId] of Object.entries(roomMessages)) {
      const sockets = await io.in(roomId).fetchSockets();

      roomSummaries.push({
        roomId,
        userCount: sockets.length,
      });
    }

    socket.emit('rooms-list', roomSummaries);
  });

  socket.on('create-room', async (roomId) => {
    if (roomMessages[roomId]) {
      socket.emit('create-error', 'Room name already taken.');

      return;
    }

    roomMessages[roomId] = [];
    socket.join(roomId);

    socket.emit('room-created', { roomId, userCount: 1 });
  });

  socket.on('join-room', async (roomId) => {
    if (!roomMessages[roomId]) {
      socket.emit('join-error', 'Room does not exist.');

      return;
    }

    socket.join(roomId);
    socket.emit('room-history', roomMessages[roomId]);
    socket.to(roomId).emit('user-joined', users[socket.id]);
  });

  socket.on('rename-room', async (roomId, newRoomId) => {
    if (roomMessages[newRoomId]) {
      socket.emit('rename-error', 'Room name already taken.');

      return;
    }

    roomMessages[newRoomId] = roomMessages[roomId] || [];
    delete roomMessages[roomId];

    const socketsInRoom = await io.in(roomId).fetchSockets();

    for (const s of socketsInRoom) {
      s.leave(roomId);
      s.join(newRoomId);
      s.emit('room-renamed', { oldRoom: roomId, newRoom: newRoomId });
    }
  });

  socket.on('delete-room', async (roomId) => {
    delete roomMessages[roomId];

    const socketsInRoom = await io.in(roomId).fetchSockets();

    for (const s of socketsInRoom) {
      s.leave(roomId);
      s.emit('room-deleted', { roomId });
    }
  });

  socket.on('room-message', async ({ roomId, message, timestamp }) => {
    const author = users[socket.id];
    if (!roomMessages[roomId]) {
      return;
    }

    const socketsInRoom = await io.in(roomId).fetchSockets();
    const isInRoom = socketsInRoom.some((s) => s.id === socket.id);

    if (!isInRoom) {
      return;
    }

    roomMessages[roomId].push({ author, message, timestamp });

    io.to(roomId).emit('room-message', {
      author,
      message,
      timestamp,
    });
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', users[socket.id]);
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
  });
});

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server listening on http://localhost:3000');
});
