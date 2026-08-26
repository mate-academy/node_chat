const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();

app.use(
  cors({
    origin: '*',
  }),
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Chat server is running');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let nextRoomId = 2;

const rooms = [
  {
    id: 1,
    name: 'General',
    messages: [],
  },
];

io.on('connection', (socket) => {
  socket.emit('connected', {
    message: 'Connected to chat server',
  });

  socket.emit('rooms:update', rooms);

  socket.on('user:set', (username) => {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      return;
    }

    socket.data.username = cleanUsername;

    socket.emit('user:set:success', cleanUsername);
  });

  socket.on('room:create', (roomName) => {
    const name = roomName.trim();

    if (!name) {
      return;
    }

    const room = {
      id: nextRoomId,
      name,
      messages: [],
    };

    nextRoomId += 1;

    rooms.push(room);

    io.emit('rooms:update', rooms);
  });

  socket.on('room:join', (roomId) => {
    const room = rooms.find((currentRoom) => currentRoom.id === Number(roomId));

    if (!room) {
      return;
    }

    if (socket.data.roomId) {
      socket.leave(String(socket.data.roomId));
    }

    socket.join(String(room.id));
    socket.data.roomId = room.id;

    socket.emit('room:joined', room);
  });

  socket.on('room:rename', ({ roomId, name }) => {
    const room = rooms.find((currentRoom) => currentRoom.id === Number(roomId));

    const cleanName = name.trim();

    if (!room || !cleanName) {
      return;
    }

    room.name = cleanName;

    io.emit('rooms:update', rooms);
  });

  socket.on('room:delete', (roomId) => {
    const roomIndex = rooms.findIndex((room) => room.id === Number(roomId));

    if (roomIndex === -1) {
      return;
    }

    rooms.splice(roomIndex, 1);

    io.emit('rooms:update', rooms);
  });

  socket.on('message:send', (text) => {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    if (!socket.data.username || !socket.data.roomId) {
      return;
    }

    const room = rooms.find(
      (currentRoom) => currentRoom.id === socket.data.roomId,
    );

    if (!room) {
      return;
    }

    const message = {
      id: Date.now(),
      author: socket.data.username,
      text: cleanText,
      time: new Date().toISOString(),
    };

    room.messages.push(message);

    io.to(String(room.id)).emit('message:new', message);
  });
});

const PORT = 3000;

server.listen(PORT);
