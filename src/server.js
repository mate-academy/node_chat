'use strict';

const path = require('node:path');
const http = require('node:http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { roomsRouter } = require('./rooms.controller');
const { store } = require('./store');

const PORT = process.env.PORT || 3000;

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api', roomsRouter);
  app.use(express.static(path.join(__dirname, '..', 'public')));

  return app;
}

function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    let username = `guest-${socket.id.slice(0, 5)}`;

    socket.on('auth', (payload) => {
      try {
        const next = String(payload?.username || '').trim();

        if (next) {
          username = next.slice(0, 40);
        }
      } catch (_) {
        // ignore auth
      }
    });

    socket.on('joinRoom', ({ roomId }) => {
      if (!store.getRoom(roomId)) {
        socket.emit('error', { message: 'Room not found' });

        return;
      }
      socket.join(roomId);

      const history = store.listMessages(roomId);

      socket.emit('room:joined', { roomId });
      socket.emit('message:history', { roomId, messages: history });
    });

    socket.on('message:send', ({ roomId, text }) => {
      if (!store.getRoom(roomId)) {
        socket.emit('error', { message: 'Room not found' });

        return;
      }

      const trimmed = String(text || '').trim();

      if (!trimmed) {
        return;
      }

      const message = store.appendMessage(roomId, username, trimmed);

      io.to(roomId).emit('message:new', { roomId, message });
    });
  });

  const broadcastRooms = () => {
    const rooms = store.listRooms();

    io.emit('rooms:update', rooms);
  };

  const createOrig = store.createRoom.bind(store);

  store.createRoom = (name) => {
    const room = createOrig(name);

    broadcastRooms();

    return room;
  };

  const renameOrig = store.renameRoom.bind(store);

  store.renameRoom = (id, name) => {
    const room = renameOrig(id, name);

    broadcastRooms();

    return room;
  };

  const deleteOrig = store.deleteRoom.bind(store);

  store.deleteRoom = (id) => {
    const res = deleteOrig(id);

    broadcastRooms();

    return res;
  };

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });

  return { app, server, io };
}

if (require.main === module) {
  bootstrap();
}

module.exports = { createApp, bootstrap };
