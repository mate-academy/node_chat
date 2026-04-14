import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
  },
});

const PORT = process.env.PORT || 3005;

app.use(express.static(path.join(dirname, '..', 'client', 'dist')));

const rooms = new Map();
const DEFAULT_ROOM = 'General';

rooms.set(DEFAULT_ROOM, { name: DEFAULT_ROOM, messages: [] });

const MAX_USERNAME_LEN = 24;
const MAX_ROOM_NAME_LEN = 40;
const MAX_MESSAGE_LEN = 1000;

function getRoomList() {
  return Array.from(rooms.entries()).map(([id, room]) => ({
    id,
    name: room.name,
  }));
}

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function createMessage(author, text) {
  return {
    author,
    text,
    time: new Date().toISOString(),
  };
}

io.on('connection', (socket) => {
  let currentRoom = null;
  let username = null;

  socket.on('setUsername', (name) => {
    const cleaned = normalizeText(name);

    if (!cleaned) {
      socket.emit('error', 'Username is required');

      return;
    }

    if (cleaned.length > MAX_USERNAME_LEN) {
      socket.emit('error', `Username must be <= ${MAX_USERNAME_LEN} chars`);

      return;
    }

    username = cleaned;
    socket.emit('roomList', getRoomList());
  });

  socket.on('joinRoom', (roomId) => {
    if (!username) {
      socket.emit('error', 'Set username first');

      return;
    }

    if (!rooms.has(roomId)) {
      socket.emit('error', 'Room does not exist');

      return;
    }

    if (currentRoom) {
      socket.leave(currentRoom);

      io.to(currentRoom).emit(
        'systemMessage',
        createMessage('System', `${username} left the room`),
      );
    }

    currentRoom = roomId;
    socket.join(roomId);

    const room = rooms.get(roomId);

    socket.emit('roomJoined', {
      id: roomId,
      name: room.name,
      messages: room.messages,
    });

    io.to(roomId).emit(
      'systemMessage',
      createMessage('System', `${username} joined the room`),
    );
  });

  socket.on('sendMessage', (text) => {
    const cleaned = normalizeText(text);

    if (!currentRoom || !username) {
      return;
    }

    if (!cleaned) {
      return;
    }

    if (cleaned.length > MAX_MESSAGE_LEN) {
      socket.emit('error', `Message must be <= ${MAX_MESSAGE_LEN} chars`);

      return;
    }

    const message = createMessage(username, cleaned);
    const room = rooms.get(currentRoom);

    if (room) {
      room.messages.push(message);
      io.to(currentRoom).emit('newMessage', message);
    }
  });

  socket.on('createRoom', (roomName) => {
    if (!username) {
      socket.emit('error', 'Set username first');

      return;
    }

    const cleaned = normalizeText(roomName);

    if (!cleaned) {
      socket.emit('error', 'Room name is required');

      return;
    }

    if (cleaned.length > MAX_ROOM_NAME_LEN) {
      socket.emit('error', `Room name must be <= ${MAX_ROOM_NAME_LEN} chars`);

      return;
    }

    const roomId = `room_${randomUUID()}`;

    rooms.set(roomId, { name: cleaned, messages: [] });
    io.emit('roomList', getRoomList());
    socket.emit('roomCreated', roomId);
  });

  socket.on('renameRoom', ({ roomId, newName }) => {
    const room = rooms.get(roomId);
    const cleaned = normalizeText(newName);

    if (!room) {
      socket.emit('error', 'Room does not exist');

      return;
    }

    if (roomId === DEFAULT_ROOM) {
      socket.emit('error', 'Cannot rename the default room');

      return;
    }

    if (!cleaned) {
      socket.emit('error', 'Room name is required');

      return;
    }

    if (cleaned.length > MAX_ROOM_NAME_LEN) {
      socket.emit('error', `Room name must be <= ${MAX_ROOM_NAME_LEN} chars`);

      return;
    }

    room.name = cleaned;
    io.emit('roomList', getRoomList());

    io.to(roomId).emit('roomRenamed', { id: roomId, name: cleaned });
  });

  socket.on('deleteRoom', (roomId) => {
    if (roomId === DEFAULT_ROOM) {
      socket.emit('error', 'Cannot delete the default room');

      return;
    }

    if (!rooms.has(roomId)) {
      socket.emit('error', 'Room does not exist');

      return;
    }

    io.to(roomId).emit('roomDeleted', roomId);

    const socketsInRoom = io.sockets.adapter.rooms.get(roomId);

    if (socketsInRoom) {
      for (const sid of socketsInRoom) {
        const s = io.sockets.sockets.get(sid);

        if (s) {
          s.leave(roomId);
        }
      }
    }

    rooms.delete(roomId);
    io.emit('roomList', getRoomList());
  });

  socket.on('disconnect', () => {
    if (currentRoom && username) {
      io.to(currentRoom).emit(
        'systemMessage',
        createMessage('System', `${username} left the room`),
      );
    }
  });
});

server.listen(PORT);
