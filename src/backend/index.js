'use strict';

import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';

const app = express();

app.use(cors());
app.use(express.json());

const emitter = new EventEmitter();

const messages = [];
const rooms = [];

app.post('/messages', (req, res) => {
  const { username, text } = req.body;

  const message = {
    username,
    text,
    time: new Date(),
  };

  messages.push(message);

  emitter.emit('message', message);
  res.status(201).send(messages);
});

app.post('/rooms', (req, res) => {
  const { username, roomName } = req.body;

  const newRoom = { username, roomName };

  rooms.push(newRoom);

  emitter.emit('room', newRoom);
  res.status(201).send(rooms);
});

app.get('/messages', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-store');

  const cb = (message) => res.write(`data: ${JSON.stringify(message)}\n\n`);

  emitter.on('message', cb);

  res.on('close', () => {
    emitter.off('message', cb);
  });
});

app.get('/rooms', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-store');

  const cb = (room) => res.write(`data: ${JSON.stringify(room)}\n\n`);

  emitter.on('room', cb);

  res.on('close', () => {
    emitter.off('room', cb);
  });
});

app.patch('/rooms/:index', (req, res) => {
  const { index } = req.params;
  const { roomName } = req.body;
  const roomIndex = parseInt(index);

  if (roomIndex < 0 || roomIndex >= rooms.length) {
    return res.status(404).send({ error: 'Room not found' });
  }

  if (!roomName || roomName.trim() === '') {
    return res.status(400).send({ error: 'Room name is required' });
  }

  rooms[roomIndex].roomName = roomName;

  emitter.emit('roomUpdated', { index: roomIndex, room: rooms[roomIndex] });
  res.status(200).send(rooms[roomIndex]);
});

app.delete('/rooms/:index', (req, res) => {
  const { index } = req.params;
  const roomIndex = parseInt(index);

  if (roomIndex < 0 || roomIndex >= rooms.length) {
    return res.status(404).send({ error: 'Room not found' });
  }

  const deletedRoom = rooms.splice(roomIndex, 1)[0];

  emitter.emit('roomDeleted', { index: roomIndex, room: deletedRoom });
  res.status(200).send(deletedRoom);
});

const server = app.listen(3005);

const wss = new WebSocketServer({ server });

wss.on('connection', (conn) => {
  conn.on('message', (text) => {
    const message = {
      text: text.toString(),
      time: new Date(),
    };

    messages.push(message);

    emitter.emit('message', message);
  });
});

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});

emitter.on('room', (room) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(room));
  }
});

emitter.on('roomUpdated', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({ type: 'roomUpdated', ...data }));
  }
});

emitter.on('roomDeleted', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({ type: 'roomDeleted', ...data }));
  }
});
