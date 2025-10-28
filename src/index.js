/* eslint-disable no-console */
'use strict';

import express from 'express';
import cors from 'cors';
import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.static('public'));

const emmiter = new EventEmitter();

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
  emmiter.emit('message', message);
  res.status(201).send(message);
});

app.get('/messages', (req, res) => {
  const { room } = req.query;

  if (!room) {
    return res.status(400).send('Room is required');
  }

  if (!rooms[room]) {
    rooms[room] = [];
  }

  res.status(200).json(rooms[room]);
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

  emmiter.on('message', onMessage);

  req.on('close', () => {
    emmiter.off('message', onMessage);
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

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const wss = new WebSocketServer({ server });

emmiter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});
