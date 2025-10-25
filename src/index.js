'use strict';
import 'dotenv/config';
import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { userRoute } from './routes/user.route.js';
import { Message } from './models/message.model.js';
import { roomsRoute } from './routes/rooms.route.js';
import { messageRoute } from './routes/message.route.js';
import { messageEmitter } from './controllers/message.controller.js';

const PORT = process.env.PORT || 3005;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/user', userRoute);
app.use('/rooms', roomsRoute);
app.use(messageRoute);


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
