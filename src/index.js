/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');
const { EventEmitter } = require('events');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.static('public'));

const emmitter = new EventEmitter();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  }),
);

const rooms = {
  General: [],
};

app.post('/messages', (req, res) => {
  const { text, author, room } = req.body;

  const message = {
    text,
    author,
    room,
    date: new Date(),
  };

  if (!rooms[room]) {
    rooms[room] = [];
  }

  rooms[room].push(message);
  emmitter.emit('message', message);
  res.status(201).send(message);
});

app.get('/rooms', (req, res) => {
  res.json(Object.keys(rooms));
});

app.get('/messages', (req, res) => {
  const { room } = req.query;

  if (!room) {
    return res.status(400).send('Room is required');
  }

  const messages = rooms[room] || [];

  res.status(200).json(messages);
});

app.get('/messages/stream', (req, res) => {
  const { room } = req.query;

  if (!room) {
    return res.status(400).send('Room is required');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-store');

  if (rooms[room]) {
    rooms[room].forEach((msg) => {
      res.write(`data: ${JSON.stringify(msg)}\n\n`);
    });
  }

  const onMessage = (message) => {
    if (message.room === room) {
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    }
  };

  emmitter.on('message', onMessage);

  req.on('close', () => {
    emmitter.off('message', onMessage);
  });
});

app.post('/rooms', (req, res) => {
  const { roomName } = req.body;

  if (!roomName) {
    return res.status(400).send('Room name is required');
  }

  if (!rooms[roomName]) {
    rooms[roomName] = [];
  }

  res.status(201).send({ roomName });
});

app.patch('/rooms/:roomName', (req, res) => {
  const { roomName } = req.params;
  const { newName } = req.body;

  if (!rooms[roomName]) {
    return res.status(404).send('Room not found');
  }

  if (!newName) {
    return res.status(400).send('New room name is required');
  }

  if (rooms[newName]) {
    return res.status(400).send('Room with this name already exists');
  }

  if (!roomName) {
    return res.status(400).send('Room name is required');
  }

  rooms[newName] = rooms[roomName];
  delete rooms[roomName];

  res.status(200).send({ roomName, newName });
});

app.delete('/rooms/:roomName', (req, res) => {
  const { roomName } = req.params;

  if (!rooms[roomName]) {
    return res.status(404).send('Room not found');
  }

  if (roomName === 'General') {
    return res.status(400).send('Cannot delete default room');
  }

  delete rooms[roomName];

  res.status(200).send({ deleted: roomName });
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const wss = new WebSocketServer({ server });

// emmiter.on('message', (message) => {
//   for (const client of wss.clients) {
//     client.send(JSON.stringify(message));
//   }
// });

wss.on('connection', (ws) => {
  ws.room = 'General';

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'join') {
        ws.room = msg.room;
      }
    } catch (e) {}
  });
});

emmitter.on('message', (message) => {
  for (const client of wss.clients) {
    if (client.readyState === 1 && client.room === message.room) {
      client.send(JSON.stringify(message));
    }
  }
});
