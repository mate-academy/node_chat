'use strict';
const express = require('express');
const { json } = require('express');
const cors = require('cors');
require('dotenv').config(); // Для 'dotenv/config' використовуємо require()
const { EventEmitter } = require('events');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = process.env.PORT || 3005;
const emitter = new EventEmitter();
const users = [];
const rooms = { all: [] };

app.use(cors());
app.use(express.json());

app.post('/user', (req, res) => {
  const { name } = req.body;
  if (users.includes(name)) {
    res.status(409).send({ message: 'User already exists' });
  }

  users.push(name);

  res.status(201).send({ message: 'User registered' });
});

app.get('/rooms', (req, res) => {
  const keys = Object.keys(rooms);

  res.send(keys).status(200);
});

app.get('/new-rooms', (req, res) => {
  const { newRoom } = req.query;

  if (!newRoom) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  if (rooms[newRoom]) {
    return res.status(400).json({ error: 'The room already exists' });
  }

  rooms[newRoom] = [];

  const keys = Object.keys(rooms);

  emitter.emit('newRoom', keys);

  res.status(200).send(keys);
});

app.post('/messages', (req, res) => {
  const { text, author, room } = req.body;

  const newMessage = {
    author,
    time: new Date(),
    text,
  };

  if (!rooms[room]) {
    rooms[room] = [];
  }

  rooms[room].push(newMessage);
  emitter.emit('message', { room, message: newMessage });

  res.status(201).send(rooms[room]);
});

app.get('/messages', (req, res) => {
  const { room } = req.query;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Cache-Control', 'no-store');

  if (room && rooms[room]) {
    res.status(200).send(rooms[room]);
  } else {
    res.status(404).send([]);
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is raning: http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'join') {
      clients.set(ws, data.room);
      console.log(`Client joined room: ${data.room}`);

      if (rooms[data.room]) {
        ws.send(
          JSON.stringify({ type: 'history', messages: rooms[data.room] }),
        );
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });
});

emitter.on('newRoom', (roomList) => {
  for (const client of clients.keys()) {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ type: 'updateRooms', rooms: roomList }));
    }
  }
});

emitter.on('message', ({ room, message }) => {
  for (const [client, clientRoom] of clients) {
    if (clientRoom === room && client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
});
