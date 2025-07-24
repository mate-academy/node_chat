'use strict';
import express from 'express';
import cors from 'cors';
import { userRouter } from './back-end/routes/user.router.js';
import { messageRouter } from './back-end/routes/message.router.js';
import { roomRouter } from './back-end/routes/room.routes.js';
import { WebSocketServer } from 'ws';
import { messageEmitter } from './back-end/controllers/message.controller.js';

const PORT = process.env.PORT || 3005;
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: '*',
  }),
);

app.use('/user', userRouter);
app.use('/rooms', roomRouter);
app.use('/rooms', messageRouter);

app.get('/', (req, res) => {
  res.send('Server is OK');
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.roomId = null;

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);

      if (parsed.type === 'join' && parsed.roomId) {
        ws.roomId = parsed.roomId;
      }
    } catch (error) {
      console.error('Invalid message from client', error);
    }
  });
});

messageEmitter.on('message', (message) => {
  for (const client of wss.clients) {
    if (client.readyState === 1 && client.roomId === message.roomId) {
      client.send(JSON.stringify(message));
    }
  }
});

