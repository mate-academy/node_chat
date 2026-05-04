import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const PORT = 3000;

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  let activeRoomId = null;

  socket.on('room:join', (roomId) => {
    if (activeRoomId) {
      socket.leave(activeRoomId);
    }

    socket.join(roomId);
    activeRoomId = roomId;
  });

  socket.on('disconnect', () => {});
});

const messages = [
  {
    id: 1,
    text: 'Hello, world!',
    author: 'User1',
    timestamp: new Date(),
    roomId: 'general',
  },
  {
    id: 2,
    text: 'Hi there!',
    author: 'User2',
    timestamp: new Date(),
    roomId: 'general',
  },
  {
    id: 3,
    text: 'Hello from User2!',
    author: 'User2',
    timestamp: new Date(),
    roomId: 'random',
  },
];

const rooms = [
  { id: 'general', name: 'General' },
  { id: 'random', name: 'Random' },
];

let nextRoomNumber = 3;

app.get('/messages', (_req, res) => {
  res.json(messages);
});

app.post('/messages', (req, res) => {
  const { text, author, roomId } = req.body;

  if (!text || !author || !roomId) {
    return res
      .status(400)
      .json({ error: 'Text, author, and roomId are required' });
  }

  const room = rooms.find((r) => r.id === roomId);

  if (!room) {
    return res.status(404).json({ error: 'Invalid roomId' });
  }

  const normalizedText = text.trim();

  if (normalizedText.length === 0) {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  const newMessage = {
    id: messages.length + 1,
    text: normalizedText,
    author,
    timestamp: new Date(),
    roomId,
  };

  messages.push(newMessage);
  io.to(roomId).emit('message:new', newMessage);

  res.status(201).json(newMessage);
});

app.get('/rooms', (_req, res) => {
  res.json(rooms);
});

app.post('/rooms', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const normalizedName = name.trim();

  if (normalizedName.length === 0) {
    return res.status(400).json({ error: 'Room name cannot be empty' });
  }

  const newRoom = {
    id: `room-${nextRoomNumber}`,
    name: normalizedName,
  };

  nextRoomNumber += 1;

  rooms.push(newRoom);

  res.status(201).json(newRoom);
});

app.patch('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const room = rooms.find((r) => r.id === roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  room.name = name;

  res.json(room);
});

app.delete('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;

  const roomIndex = rooms.findIndex((r) => r.id === roomId);

  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  rooms.splice(roomIndex, 1);

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].roomId === roomId) {
      messages.splice(i, 1);
    }
  }

  res.status(204).send();
});

app.get('/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;

  const room = rooms.find((r) => r.id === roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const roomMessages = messages.filter((msg) => msg.roomId === roomId);

  res.json(roomMessages);
});

httpServer.listen(PORT);
