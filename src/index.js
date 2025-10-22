'use strict';

import express from 'express';
import cors from 'cors';
import { emitter } from './emitter.js';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { GET } from './utils.js';

const app = express();

app.use(cors());
app.use(express.json());

const messages = [];
const rooms = [];

app.post('/messages', (req, res) => {
  const { author, text, roomId } = req.body;

  const message = {
    id: uuidv4(),
    author,
    text,
    roomId,
    date: new Date(),
  };

  messages.push(message);

  emitter.emit('message', message);
  res.status(201).send(messages);
});

app.post('/rooms', (req, res) => {
  const { user, name } = req.body;

  const newRoom = { id: uuidv4(), user, name };

  rooms.push(newRoom);

  emitter.emit('room', newRoom);
  res.status(201).send(rooms);
});

app.get('/messages', (req, res) => GET('message', req, res));

app.get('/rooms', (req, res) => GET('room', req, res));

app.patch('/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { user, name } = req.body;

  const index = rooms.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).send({ error: 'Room not found' });
  }

  // Update the room
  rooms[index] = {
    ...rooms[index],
    ...(user && { user }),
    ...(name && { name }),
  };

  emitter.emit('room-updated', { index, room: rooms[index] });
  res.status(200).send(rooms[index]);
});

app.delete('/rooms/:id', (req, res) => {
  const { id } = req.params;

  const index = rooms.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).send({ error: 'Room not found' });
  }

  const deletedRoom = rooms.splice(index, 1)[0];

  emitter.emit('room-deleted', { id, room: deletedRoom });
  res.status(200).send(deletedRoom);
});

const server = app.listen(3005);

const wss = new WebSocketServer({ server });

wss.on('connection', (conn) => {
  conn.send(JSON.stringify({ type: 'init', messages, rooms }));

  conn.on('message', (payload) => {
    const data = JSON.parse(payload);

    switch (data.type) {
      case 'message':
        const message = {
          id: uuidv4(),
          author: data.author,
          text: data.text,
          roomId: data.roomId,
          date: new Date(),
        };

        messages.push(message);
        emitter.emit('message', message);
        break;
      case 'room':
        const room = {
          id: uuidv4(),
          user: data.user,
          name: data.name,
        };

        rooms.push(room);
        emitter.emit('room', room);
        break;
      default:
        break;
    }
  });
});

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({ type: 'message', ...message }));
  }
});

emitter.on('room', (room) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({ type: 'room', ...room }));
  }
});

emitter.on('room-updated', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({ type: 'room-updated', ...data }));
  }
});

emitter.on('room-deleted', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({ type: 'room-deleted', ...data }));
  }
});
