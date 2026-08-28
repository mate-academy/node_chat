import express from 'express';
import cors from 'cors';
import { prisma } from './db.js';
import { errorHandler } from './errorHandler.js';
import { initRealtime, broadcast } from './realtime.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Chat server is running');
});

/* Rooms */

app.get('/api/rooms', async (req, res) => {
  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: 'asc' },
  });

  res.json(rooms);
});

// Create a room
app.post('/api/rooms', async (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const room = await prisma.room.create({ data: { name } });

  broadcast('room:created', room);
  res.status(201).json(room);
});

// Rename a room
app.patch('/api/rooms/:id', async (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: { name },
  });

  broadcast('room:updated', room);
  res.json(room);
});

app.delete('/api/rooms/:id', async (req, res) => {
  await prisma.room.delete({ where: { id: req.params.id } });

  broadcast('room:deleted', { id: req.params.id });
  res.status(204).end();
});

/* Messages */

app.get('/api/rooms/:id/messages', async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { roomId: req.params.id },
    orderBy: { createdAt: 'asc' },
  });

  res.json(messages);
});

app.post('/api/rooms/:id/messages', async (req, res) => {
  const author = req.body.author?.trim();
  const text = req.body.text?.trim();

  if (!author || !text) {
    return res.status(400).json({ error: 'author and text are required' });
  }

  const message = await prisma.message.create({
    data: { author, text, roomId: req.params.id },
  });

  broadcast('message:created', message);
  res.status(201).json(message);
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

initRealtime(server);
