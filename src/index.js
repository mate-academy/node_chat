'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Data storage (in production, use a database)
const rooms = new Map();

// Initialize default room
rooms.set('general', {
  name: 'General',
  messages: [],
  users: new Set(),
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Join room
  socket.on('joinRoom', (data) => {
    const { roomName, username } = data;

    if (!rooms.has(roomName)) {
      rooms.set(roomName, {
        name: roomName,
        messages: [],
        users: new Set(),
      });
    }

    const room = rooms.get(roomName);

    room.users.add(username);
    socket.join(roomName);
    socket.username = username;
    socket.currentRoom = roomName;

    // Send room history
    socket.emit('roomHistory', {
      room: roomName,
      messages: room.messages,
    });

    // Notify others
    socket.to(roomName).emit('userJoined', {
      username,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle messages
  socket.on('sendMessage', (data) => {
    const { message, roomName } = data;
    const username = socket.username;

    if (!username || !roomName) {
      return;
    }

    // Check for empty or whitespace-only messages
    if (!message || String(message).trim().length === 0) {
      socket.emit('error', {
        code: 'EMPTY_MESSAGE',
        message: 'Message cannot be empty',
      });

      return;
    }

    const messageObj = {
      id: Date.now().toString(),
      author: username,
      text: message,
      time: Date.now(),
      room: roomName,
    };

    // Store message
    if (rooms.has(roomName)) {
      const room = rooms.get(roomName);

      room.messages.push(messageObj);

      // Keep only last 100 messages
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }
    }

    // Broadcast to room
    io.to(roomName).emit('newMessage', messageObj);
  });

  // Create room
  socket.on('createRoom', (data) => {
    const { roomName } = data;

    if (rooms.has(roomName)) {
      socket.emit('error', { message: 'Room already exists' });

      return;
    }

    rooms.set(roomName, {
      name: roomName,
      messages: [],
      users: new Set(),
    });

    io.emit('roomCreated', { roomName });
  });

  // Rename room
  socket.on('renameRoom', (data) => {
    const { oldName, newName } = data;

    if (!rooms.has(oldName)) {
      socket.emit('error', { message: 'Room does not exist' });

      return;
    }

    if (rooms.has(newName)) {
      socket.emit('error', { message: 'New name already exists' });

      return;
    }

    const room = rooms.get(oldName);

    room.name = newName;

    // Move all clients from old room to new room
    const clientsInRoom = io.sockets.adapter.rooms.get(oldName);

    if (clientsInRoom) {
      clientsInRoom.forEach((clientId) => {
        const clientSocket = io.sockets.sockets.get(clientId);

        if (clientSocket) {
          clientSocket.leave(oldName);
          clientSocket.join(newName);
          clientSocket.currentRoom = newName;
        }
      });
    }

    // Update room data structure
    rooms.delete(oldName);

    rooms.set(newName, room);

    // Notify all clients about the rename
    io.emit('roomRenamed', { oldName, newName });
  });

  // Delete room
  socket.on('deleteRoom', (data) => {
    const { roomName } = data;

    if (!rooms.has(roomName)) {
      socket.emit('error', { message: 'Room does not exist' });

      return;
    }

    if (roomName === 'general') {
      socket.emit('error', { message: 'Cannot delete general room' });

      return;
    }

    // Notify clients in the room before deletion
    io.to(roomName).emit('roomDeleted', { room: roomName });

    // Move all clients from deleted room to general room
    const clientsInRoom = io.sockets.adapter.rooms.get(roomName);

    if (clientsInRoom) {
      clientsInRoom.forEach((clientId) => {
        const clientSocket = io.sockets.sockets.get(clientId);

        if (clientSocket) {
          clientSocket.leave(roomName);
          clientSocket.join('general');
          clientSocket.currentRoom = 'general';
        }
      });
    }

    // Delete the room
    rooms.delete(roomName);

    // Notify all clients about the deletion
    io.emit('roomDeleted', { roomName });
  });

  // Get rooms list
  socket.on('getRooms', () => {
    const roomsList = Array.from(rooms.keys()).map((name) => ({
      name,
      userCount: rooms.get(name).users.size,
      messageCount: rooms.get(name).messages.length,
    }));

    socket.emit('roomsList', roomsList);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username && socket.currentRoom) {
      const room = rooms.get(socket.currentRoom);

      if (room) {
        room.users.delete(socket.username);
      }

      socket.to(socket.currentRoom).emit('userLeft', {
        username: socket.username,
        timestamp: new Date().toISOString(),
      });
    }
  });
});

// API endpoints
app.get('/api/rooms', (req, res) => {
  const roomsList = Array.from(rooms.keys()).map((name) => ({
    name,
    userCount: rooms.get(name).users.size,
    messageCount: rooms.get(name).messages.length,
  }));

  res.json(roomsList);
});

app.get('/api/rooms/:roomName/messages', (req, res) => {
  const { roomName } = req.params;

  if (!rooms.has(roomName)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json(rooms.get(roomName).messages);
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Chat server running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Open http://localhost:${PORT} in your browser`);
});
