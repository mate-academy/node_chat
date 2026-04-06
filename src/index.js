'use strict';

const path = require('path');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const DEFAULT_ROOM_ID = 'general';

const app = express();
const server = createServer(app);
const io = new Server(server);

let roomIdCounter = 1;
let messageIdCounter = 1;

const rooms = [
  {
    id: DEFAULT_ROOM_ID,
    name: 'General',
    messages: [],
  },
];

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function getRoomsPayload() {
  return rooms.map(({ id, name }) => ({ id, name }));
}

function findRoom(roomId) {
  return rooms.find((room) => room.id === roomId);
}

function getFallbackRoom(excludedRoomId) {
  return rooms.find((room) => room.id !== excludedRoomId) || null;
}

function createMessage({ author, text, roomId }) {
  return {
    id: String(messageIdCounter++),
    author,
    text,
    roomId,
    time: new Date().toISOString(),
  };
}

function broadcastRooms() {
  io.emit('rooms:updated', {
    rooms: getRoomsPayload(),
  });
}

function sendRoomSnapshot(socket, roomId) {
  const room = findRoom(roomId);

  if (!room) {
    return;
  }

  socket.emit('room:joined', {
    roomId: room.id,
    roomName: room.name,
    rooms: getRoomsPayload(),
    messages: room.messages,
  });
}

app.get('/api/state', (req, res) => {
  const activeRoom = findRoom(DEFAULT_ROOM_ID) || rooms[0];

  res.json({
    rooms: getRoomsPayload(),
    activeRoomId: activeRoom.id,
    messages: activeRoom.messages,
  });
});

app.get('/api/rooms/:roomId/messages', (req, res) => {
  const room = findRoom(req.params.roomId);

  if (!room) {
    res.status(404).json({
      error: 'Room not found',
    });

    return;
  }

  res.json(room.messages);
});

app.post('/api/rooms', (req, res) => {
  const name = String(req.body.name || '').trim();

  if (!name) {
    res.status(400).json({
      error: 'Room name is required',
    });

    return;
  }

  const room = {
    id: `room-${roomIdCounter++}`,
    name,
    messages: [],
  };

  rooms.push(room);
  broadcastRooms();

  res.status(201).json(room);
});

app.patch('/api/rooms/:roomId', (req, res) => {
  const room = findRoom(req.params.roomId);
  const name = String(req.body.name || '').trim();

  if (!room) {
    res.status(404).json({
      error: 'Room not found',
    });

    return;
  }

  if (!name) {
    res.status(400).json({
      error: 'Room name is required',
    });

    return;
  }

  room.name = name;

  io.emit('room:renamed', {
    roomId: room.id,
    name: room.name,
  });
  broadcastRooms();

  res.json(room);
});

app.delete('/api/rooms/:roomId', (req, res) => {
  const roomIndex = rooms.findIndex((room) => room.id === req.params.roomId);

  if (roomIndex === -1) {
    res.status(404).json({
      error: 'Room not found',
    });

    return;
  }

  if (rooms.length === 1) {
    res.status(400).json({
      error: 'At least one room must exist',
    });

    return;
  }

  const [deletedRoom] = rooms.splice(roomIndex, 1);
  const fallbackRoom = getFallbackRoom(deletedRoom.id);

  for (const socket of io.of('/').sockets.values()) {
    if (socket.data.roomId !== deletedRoom.id) {
      continue;
    }

    socket.leave(deletedRoom.id);

    if (!fallbackRoom) {
      continue;
    }

    socket.data.roomId = fallbackRoom.id;
    socket.join(fallbackRoom.id);
    sendRoomSnapshot(socket, fallbackRoom.id);
  }

  io.emit('room:deleted', {
    roomId: deletedRoom.id,
    fallbackRoomId: fallbackRoom && fallbackRoom.id,
  });
  broadcastRooms();

  res.status(204).end();
});

io.on('connection', (socket) => {
  socket.data.username = '';
  socket.data.roomId = DEFAULT_ROOM_ID;
  socket.join(DEFAULT_ROOM_ID);
  sendRoomSnapshot(socket, DEFAULT_ROOM_ID);

  socket.on('set:username', (payload) => {
    const username = String((payload && payload.username) || '').trim();

    if (!username) {
      socket.emit('chat:error', {
        error: 'Username is required',
      });

      return;
    }

    socket.data.username = username;

    socket.emit('username:updated', {
      username,
    });
  });

  socket.on('join:room', (payload) => {
    const roomId = String((payload && payload.roomId) || '');
    const room = findRoom(roomId);

    if (!room) {
      socket.emit('chat:error', {
        error: 'Room not found',
      });

      return;
    }

    socket.leave(socket.data.roomId);
    socket.data.roomId = room.id;
    socket.join(room.id);
    sendRoomSnapshot(socket, room.id);
  });

  socket.on('message:create', (payload) => {
    const text = String((payload && payload.text) || '').trim();
    const room = findRoom(socket.data.roomId);

    if (!socket.data.username) {
      socket.emit('chat:error', {
        error: 'Set a username before sending messages',
      });

      return;
    }

    if (!room) {
      socket.emit('chat:error', {
        error: 'Room not found',
      });

      return;
    }

    if (!text) {
      socket.emit('chat:error', {
        error: 'Message text is required',
      });

      return;
    }

    const message = createMessage({
      author: socket.data.username,
      text,
      roomId: room.id,
    });

    room.messages.push(message);
    io.to(room.id).emit('message:created', message);
  });
});

app.get(/^(?!\/api|\/socket\.io).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
});
