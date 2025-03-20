/* eslint-disable no-console */

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'node:events';

import 'dotenv/config';

import { userRouter } from './routes/user.route.js';
import { roomRouter } from './routes/room.route.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const PORT = process.env.PORT || 3005;
const app = express();
const messageEmitter = new EventEmitter();

app.use(express.json());
app.use(cors());

app.use('/user', userRouter);
app.use('/rooms', roomRouter);

app.get('/', async (req, res) => {
  res.status(200).send('Test Response');
});

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

messageEmitter.on('message', (data) => {
  for (const client of wss.clients) {
    if (client.roomId === data.roomId) {
      client.send(JSON.stringify(data));
    }
  }
});

wss.on('connection', (client, request) => {
  // Event handler for new client connections
  console.log('A new client connected');

  if (request?.url === '/ws') {
    console.log('Basic WebSocket handshake - skipping');

    return;
  }

  const getRoomId = (url) => {
    try {
      if (!url) {
        return null;
      }

      const roomsPart = url.split('/rooms/')[1];

      if (!roomsPart) {
        return null;
      }

      const id = roomsPart.split('/')[0];

      return id || null;
    } catch (error) {
      console.error('Error parsing room ID:', error);

      return null;
    }
  };

  const roomId = getRoomId(request?.url);

  if (!roomId) {
    console.error('Invalid room ID from URL:', request?.url);
    client.close();

    return;
  }

  client.roomId = roomId;

  // Event handler for receiving data from clients
  client.on('message', (data) => {
    messageEmitter.emit('message', {
      ...JSON.parse(data),
      roomId: client.roomId,
    });
  });
});
