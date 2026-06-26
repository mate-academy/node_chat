const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

const rooms = new Map();

app.get('/rooms', (req, res) => {
  res.json([...rooms.keys()]);
});

app.post('/rooms', (req, res) => {
  const { name } = req.body;

  if (rooms.has(name)) {
    return res.status(409).json({ error: 'Room already exists' });
  }

  rooms.set(name, []);
  res.status(201).json({ name });
});

app.delete('/rooms/:name', (req, res) => {
  const { name } = req.params;

  if (!rooms.delete(name)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  for (const client of clientsInRoom(name)) {
    client.close();
  }

  res.status(204).send();
});

app.patch('/rooms/:name', (req, res) => {
  const { name } = req.params;
  const { name: newName } = req.body;

  if (!rooms.has(name)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (rooms.has(newName)) {
    return res.status(409).json({ error: 'Room already exists' });
  }

  rooms.set(newName, rooms.get(name));
  rooms.delete(name);

  for (const client of clientsInRoom(name)) {
    client.room = newName;
  }

  res.json({ name: newName });
});

app.post('/messages', (req, res) => {
  const message = {
    text: req.body.text,
    author: req.body.author,
    room: req.body.room,
    time: new Date(),
  };

  if (!rooms.has(message.room)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  rooms.get(message.room).push(message);

  const payload = JSON.stringify(message);

  for (const client of clientsInRoom(message.room)) {
    client.send(payload);
  }

  res.status(201).json(message);
});

const server = app.listen(PORT);
const wss = new WebSocketServer({ server });

function clientsInRoom(name) {
  return [...wss.clients].filter((c) => c.room === name);
}

wss.on('connection', (client, req) => {
  const url = new URL(req.url, 'http://localhost');

  client.room = url.searchParams.get('room');

  if (!rooms.has(client.room)) {
    client.close();

    return;
  }

  for (const message of rooms.get(client.room)) {
    client.send(JSON.stringify(message));
  }
});
