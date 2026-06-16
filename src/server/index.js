'use strict';

import express from 'express';
import 'dotenv/config.js';
import cors from 'cors';

import { WebSocketServer } from 'ws';
import { messageRouter } from './routes/message.router.js';
import { roomRouter } from './routes/room.router.js';
import { messageEmitter } from './controllers/message.controller.js';

import { Message } from './models/message.js';
import { Room } from './models/room.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(cors());
app.use(express.json());
app.use(messageRouter);
app.use(roomRouter);

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

const rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const { roomId } = JSON.parse(data);

    const room = await Room.findByPk(roomId);

    if (!room) {
      ws.send(JSON.stringify({ error: 'Room not found' }));

      return;
    }

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    if (!rooms[roomId].includes(ws)) {
      rooms[roomId].push(ws);
    }

    const messages = await Message.findAll({
      where: { roomId },
      order: [['createdAt', 'ASC']],
    });

    messages.forEach((message) => {
      ws.send(JSON.stringify(message));
    });
  });

  ws.on('close', () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((client) => client !== ws);

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

messageEmitter.on('message', (message) => {
  const { roomId } = message;

  if (!rooms[roomId]) {
    return;
  }

  rooms[roomId].forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
});
