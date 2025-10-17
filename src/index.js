'use strict';
import 'dotenv/config';
import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { userRoute } from './routes/user.route.js';
import { roomsRoute } from './routes/rooms.route.js';
import { messageRoute } from './routes/message.route.js';
import { messageEmitter } from './controllers/message.controller.js';
import { messageService } from './services/message.service.js';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', userRoute);
app.use('/rooms', roomsRoute);
app.use(messageRoute);

const server = app.listen(PORT);

const wss = new WebSocketServer({ server });
const rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', async (rawMessage) => {
    let parsed;

    try {
      parsed = JSON.parse(rawMessage);
    } catch {
      return;
    }

    const { roomId } = parsed;

    if (!roomId || typeof roomId !== 'number') {
      return;
    }

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    if (!rooms[roomId].includes(ws)) {
      rooms[roomId].push(ws);
    }

    const messages = await messageService.getAllMessagesInRoom(roomId);

    messages.forEach((msg) => {
      ws.send(JSON.stringify(msg));
    });
  });

  ws.on('close', () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((client) => client !== ws);
    }
  });
});

messageEmitter.on('message', async (message) => {
  const { roomId } = message;

  if (!roomId || !rooms[roomId]) {
    return;
  }

  const formatted = {
    author: message.author || message.User?.name || 'Unknown',
    time: message.time || message.createdAt,
    text: message.text,
  };

  rooms[roomId].forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(formatted));
    }
  });
});
