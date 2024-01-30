'use strict';

const express = require('express');
const cors = require('cors');
const { EventEmitter } = require('events');
const { WebSocketServer } = require('ws');
const { randomUUID } = require('crypto');

const app = express();

app.use(express.json());
app.use(cors());

const emitter = new EventEmitter();

const rooms = [{
  id: randomUUID(), name: 'Cats', color: 'red', messages: [],
}, {
  id: randomUUID(), name: 'Dogs', color: 'green', messages: [],
}];

app.get('/rooms', (req, res) => {
  res.send(rooms);
});

app.post('/rooms', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.sendStatus(400);
  }

  if (rooms.some((room) => room.name === name)) {
    return res.status(409).end('Room already exists');
  }

  const randomHexColor
  = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  rooms.push({
    id: randomUUID(), name, color: randomHexColor, messages: [],
  });

  emitter.emit('update');

  res.send(rooms);
});

app.patch('/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id || !name) {
    return res.sendStatus(400);
  }

  const room = rooms.find((currRoom) => currRoom.id === id);

  if (!room) {
    return res.sendStatus(404);
  }

  room.name = name;

  emitter.emit('update');

  res.send(room);
});

app.delete('/rooms/:id', (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.sendStatus(400);
  }

  const roomIndex = rooms.findIndex((room) => room.id === id);

  rooms.splice(roomIndex, 1);

  emitter.emit('update');

  res.send(rooms);
});

app.post('/messages', (req, res) => {
  const { userName, text, roomId } = req.body;

  if (!userName || !text || !roomId) {
    return res.sendStatus(400);
  }

  const newMessage = {
    id: randomUUID(),
    text,
    author: userName,
    createdAt: new Date(),
  };

  const room = rooms.find((currRoom) => currRoom.id === roomId);

  room.messages.push(newMessage);

  emitter.emit('update', {
    ...newMessage, roomId,
  });

  res.status(201).send(newMessage);
});

const server = app.listen(4000);

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify({
    rooms,
  }));
});

emitter.on('update', () => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({
      rooms,
    }));
  }
});
