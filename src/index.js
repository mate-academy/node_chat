'use strict';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { WebSocketServer } from 'ws';
import { userRoute } from './routes/user.route.js';
import { roomRoute } from './routes/room.route.js';
import { messageRoute } from './routes/message.route.js';
import { Message } from './models/Message.js';
import { messageEmitter } from './controllers/message.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
  }),
);

app.use(express.json());

app.use('/users', userRoute);
app.use('/rooms', roomRoute);
app.use(messageRoute);

const server = app.listen(PORT, () => {
  // console.log('server is running');
});

const wss = new WebSocketServer({ server });

const rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { roomId } = JSON.parse(message);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push(ws);

    const messages = await Message.findAll({ where: { roomId } });

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

  if (rooms[roomId]) {
    rooms[roomId].forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  }
});
