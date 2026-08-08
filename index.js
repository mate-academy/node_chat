import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';

const app = express();

app.use(cors());
app.use(express.json());

const emitter = new EventEmitter();

const rooms = [];

app.post('/rooms', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.sendStatus(400);
  }

  const newRoom = {
    id: Date.now(),
    name,
    messages: [],
  };

  rooms.push(newRoom);

  res.status(201).send(newRoom);
});

app.get('/rooms', (req, res) => {
  return res.send(rooms);
});

app.patch('/rooms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: "Field 'name' is required and must be a non-empty string",
      });
    }

    const room = rooms.find((room) => room.id === +id);

    if (!room) {
      return res.status(404).json({ error: `Room with id ${id} not found` });
    }

    room.name = name.trim();

    return res.status(200).json(room);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/rooms/:id', (req, res) => {
  try {
    const { id } = req.params;

    const roomIndex = rooms.findIndex((room) => room.id === +id);

    if (roomIndex === -1) {
      return res.status(404).json({ error: `Room with id ${id} not found` });
    }

    rooms.splice(roomIndex, 1);

    return res.sendStatus(200);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/rooms/:id/message', (req, res) => {
  const { text, author } = req.body;

  if (!text) {
    return res.sendStatus(400);
  }

  const room = rooms.find((room) => room.id === Number(req.params.id));

  if (!room) {
    return res.sendStatus(404);
  }

  const message = {
    id: Date.now(),
    text,
    author,
    time: new Date(),
    roomId: room.id,
  };

  room.messages.push(message);

  emitter.emit('message', message);

  res.status(201).send(room.messages);
});

app.post('/user', (req, res) => {
  const name = req.body.username?.trim();

  if (!name) {
    res.status(400).send({ error: 'Username is required' });

    return;
  }

  res.status(201).send({ username: name });
});

app.get('/rooms/:id/messages', (req, res) => {
  const room = rooms.find((room) => room.id === Number(req.params.id));

  if (!room) {
    return res.sendStatus(404);
  }

  res.send(room.messages);
});

const server = app.listen(3005, (req, res) => {
  console.log('Server is running');
});

const wss = new WebSocketServer({ server });

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});
