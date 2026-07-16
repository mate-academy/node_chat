import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import EventEmitter from 'node:events';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

type Message = {
  id: string;
  text: string;
  time: Date;
  author: string;
  roomId: string;
};

type Room = {
  id: string;
  name: string;
};

type User = {
  name: string;
}

const users: User[] = [];

app.post('/users', (req, res) => {
  const name = req.body.name;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });

    return;
  }

  const user = { name };

  users.push(user);

  res.status(201).json(user);
});

const rooms = [
  {
    id: 'general',
    name: 'General',
  },
] as Room[];

const messages = [] as Message[];
const messageEmitter = new EventEmitter();

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Connection', 'keep-alive');

  const callback = (data: Message) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  messageEmitter.on('message', callback);
  req.on('close', () => messageEmitter.off('message', callback));
});

app.get('/rooms', (req, res) => {
  res.json(rooms);
});

app.post('/rooms', (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    res.status(400).json({ error: 'Room name is required' });

    return;
  }

  const room = {
    id: crypto.randomUUID(),
    name,
  };

  rooms.push(room);

  res.status(201).json(room);
});

app.patch('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const name = req.body.name?.trim();

  if (!name) {
    res.status(400).json({ error: 'Room name is required' });

    return;
  }

  const room = rooms.find(currentRoom => currentRoom.id === roomId);

  if (!room) {
    res.status(404).json({ error: 'Room not found' });

    return;
  }

  room.name = name;

  res.json(room);
});

app.delete('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;

  const roomIndex = rooms.findIndex(room => room.id === roomId);

  if (roomIndex === -1) {
    res.status(404).json({ error: 'Room not found' });

    return;
  }

  if (roomId === 'general') {
    res.status(400).json({ error: 'General room cannot be deleted' });

    return;
  }

  rooms.splice(roomIndex, 1);

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].roomId === roomId) {
      messages.splice(i, 1);
    }
  }

  res.sendStatus(204);
});

app.get('/messages', (req, res) => {
  const roomId = req.query.roomId as string;

  if (!roomId) {
    res.status(400).json({ error: 'roomId is required' });

    return;
  }

  const roomMessages = messages.filter(message => message.roomId === roomId);

  res.json(roomMessages);
});

app.post('/messages', (req, res) => {
   const { text, author, roomId } = req.body;

  if (!text || !author || !roomId) {
    res.status(400).json({ error: 'text, author and roomId are required' });

    return;
  }

  const roomExists = rooms.some(room => room.id === roomId);

  if (!roomExists) {
    res.status(404).json({ error: 'Room not found' });

    return;
  }

  const message = {
    id: crypto.randomUUID(),
    text,
    author,
    roomId,
    time: new Date(),
  };

  messages.push(message);
  messageEmitter.emit('message', message);

  res.status(201).json(message);
});

const server = app.listen(PORT);
const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  // Event handler for new client connections
  console.log('A new client connected');

  // Event handler for receiving data from clients
  client.on('message', (data) => {
    console.log(`Received data: ${data}`);

    // Sending a response to the client
    client.send('Data received');
  });
});

messageEmitter.on('message', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(data));
  }
});
