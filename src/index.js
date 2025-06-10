'use strict';

import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3005;
const app = express();

app.use(express.json());
app.use(cors());

const emitter = new EventEmitter();
const rooms = new Map();

app.post('/messages', (req, res) => {
  const { text, author, room } = req.body;

  if (!rooms.has(room)) {
    return res.status(404).send({ error: 'Room does not exist' });
  }

  const message = {
    text,
    author,
    room,
    time: new Date().toISOString(),
  };

  rooms.get(room).push(message);
  emitter.emit('message', message);

  res.status(201).send({ status: 'sent' });
});

app.get('/rooms/:room/messages', (req, res) => {
  const { room } = req.params;

  res.send(rooms.get(room) || []);
});

app.get('/rooms', (req, res) => {
  res.send([...rooms.keys()]);
});

app.post('/rooms', (req, res) => {
  const { name } = req.body;

  if (!rooms.has(name)) {
    rooms.set(name, []);
    emitter.emit('room-update', { action: 'created', name });
    res.status(201).send({ status: 'created' });
  } else {
    res.status(400).send({ error: 'Room already exists' });
  }
});

app.delete('/rooms/:room', (req, res) => {
  rooms.delete(req.params.room);
  emitter.emit('room-update', { action: 'deleted', name: req.params.room });
  res.send({ status: 'deleted' });
});

app.put('/rooms/:oldName', (req, res) => {
  const { oldName } = req.params;
  const { newName } = req.body;

  if (!rooms.has(oldName)) {
    return res.status(404).send();
  }

  if (rooms.has(newName)) {
    return res.status(400).send();
  }

  const messages = rooms.get(oldName);

  rooms.set(newName, messages);
  rooms.delete(oldName);

  emitter.emit('room-update', {
    action: 'renamed',
    oldName,
    newName,
  });

  res.send({ status: 'renamed' });
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}/`);
});

const wss = new WebSocketServer({ server });

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({ type: 'message', payload: message }));
  }
});

emitter.on('room-update', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({ type: 'room-update', payload: data }));
  }
});
