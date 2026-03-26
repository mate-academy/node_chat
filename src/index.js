/* eslint-disable no-console */
'use strict';

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());

const messagesHistory = {};

const rooms = [
  { id: '1', name: 'Frontend Party' },
  { id: '2', name: 'Node.js Задроти' },
];

app.get('/rooms', (req, res) => {
  res.json(rooms);
});

app.get('/rooms/:id/messages', (req, res) => {
  const roomId = req.params.id;
  const history = messagesHistory[roomId] || [];

  res.json(history);
});

app.post('/rooms', (req, res) => {
  const newRoomName = req.body.name;
  const newRoom = {
    id: Date.now().toString(),
    name: newRoomName,
  };

  rooms.push(newRoom);
  res.json(newRoom);
});

app.delete('/rooms/:id', (req, res) => {
  const roomId = req.params.id;
  const roomIndex = rooms.findIndex((room) => room.id === roomId);

  if (roomIndex !== -1) {
    rooms.splice(roomIndex, 1);
    delete messagesHistory[roomId];
    res.json({ success: true, id: roomId });
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

app.patch('/rooms/:id', (req, res) => {
  const roomId = req.params.id;
  const newName = req.body.name;
  const room = rooms.find((r) => r.id === roomId);

  if (room) {
    room.name = newName;
    res.json({ success: true, room });
  } else {
    res.status(404).json({ error: 'Кімнату не знайдено' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (rowData) => {
    const parsedData = JSON.parse(rowData);

    parsedData.time = new Date().toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });

    parsedData.id =
      Date.now().toString() + Math.random().toString(36).substring(2, 9);

    console.log('ОТРИМАЛИ ПОВІДОМЛЕННЯ:', parsedData);

    const roomId = parsedData.roomId;

    if (!messagesHistory[roomId]) {
      messagesHistory[roomId] = [];
    }
    messagesHistory[roomId].push(parsedData);

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(parsedData));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
