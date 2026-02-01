'use strict';

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const rooms = new Map();

function ensureDefaultRoom() {
  if (!rooms.has('general')) {
    rooms.set('general', { name: 'General', messages: [] });
  }
}
ensureDefaultRoom();

function roomsList() {
  return Array.from(rooms.entries()).map(([id, room]) => ({
    id,
    name: room.name,
  }));
}

function makeMessage(author, text) {
  return {
    id: `m_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    author,
    time: new Date().toISOString(),
    text,
  };
}

app.get('/health', (req, res) => res.json({ ok: true }));

// HTTP API (optional, but keeps api.ts and socket flow consistent)
app.get('/rooms', (req, res) => res.json(roomsList()));

app.get('/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;

  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  return res.json(rooms.get(roomId).messages);
});

app.post('/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const { text, author } = req.body || {};

  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Invalid text' });
  }

  const safeAuthor =
    typeof author === 'string' && author.trim() ? author.trim() : 'Anonymous';

  const message = makeMessage(safeAuthor, text.trim());

  rooms.get(roomId).messages.push(message);
  io.to(roomId).emit('message:new', message);

  return res.status(201).json(message);
});

io.on('connection', (socket) => {
  socket.data.username = null;
  socket.data.roomId = 'general';

  socket.emit('room:list', roomsList());

  // Default join to "general" so the client has something usable immediately.
  socket.join('general');

  socket.emit('room:joined', {
    roomId: 'general',
    roomName: rooms.get('general').name,
  });
  socket.emit('room:history', rooms.get('general').messages);

  socket.on('user:set', (username) => {
    if (typeof username !== 'string' || username.trim() === '') {
      return;
    }

    socket.data.username = username.trim();
    socket.emit('user:ack', socket.data.username);
  });

  socket.on('room:create', (roomName) => {
    if (typeof roomName !== 'string' || !roomName.trim()) {
      return;
    }

    const id = `room_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    rooms.set(id, { name: roomName.trim(), messages: [] });
    io.emit('room:list', roomsList());
  });

  socket.on('room:rename', ({ roomId, roomName }) => {
    if (!rooms.has(roomId)) {
      return;
    }

    if (typeof roomName !== 'string' || !roomName.trim()) {
      return;
    }

    rooms.get(roomId).name = roomName.trim();
    io.emit('room:list', roomsList());

    io.to(roomId).emit('room:renamed', {
      roomId,
      roomName: rooms.get(roomId).name,
    });
  });

  socket.on('room:delete', (roomId) => {
    if (roomId === 'general') {
      return;
    }

    if (!rooms.has(roomId)) {
      return;
    }

    rooms.delete(roomId);
    io.in(roomId).socketsLeave(roomId);
    io.emit('room:list', roomsList());

    // If someone was in the deleted room, send them to general
    io.fetchSockets()
      .then((sockets) => {
        sockets
          .filter((s) => s.data.roomId === roomId)
          .forEach((s) => {
            s.data.roomId = 'general';
            s.join('general');

            s.emit('room:joined', {
              roomId: 'general',
              roomName: rooms.get('general').name,
            });
            s.emit('room:history', rooms.get('general').messages);
          });
      })
      .catch(() => {});
  });

  socket.on('room:join', (roomId) => {
    if (!rooms.has(roomId)) {
      return;
    }

    socket.leave(socket.data.roomId);
    socket.data.roomId = roomId;
    socket.join(roomId);

    socket.emit('room:joined', { roomId, roomName: rooms.get(roomId).name });
    socket.emit('room:history', rooms.get(roomId).messages);
  });

  socket.on('message:send', (text) => {
    if (typeof text !== 'string' || !text.trim()) {
      return;
    }

    const roomId = socket.data.roomId;

    if (!rooms.has(roomId)) {
      return;
    }

    const author = socket.data.username || 'Anonymous';
    const message = makeMessage(author, text.trim());

    rooms.get(roomId).messages.push(message);
    io.to(roomId).emit('message:new', message);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server: http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Client origin: ${CLIENT_ORIGIN}`);
});
