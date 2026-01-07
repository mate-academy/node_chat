/* eslint-disable no-console */
'use strict';

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import { roomRouter } from './routers/room.route.js';
import { initWebSocket } from './socket/index.js';

const PORT = process.env.PORT || 3005;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('/rooms', roomRouter);

const server = app.listen(PORT, () => {
  console.log('Server is running on http://localhost:3005');
});

const wss = new WebSocketServer({ server });

const broadcast = (data) => {
  const payload = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

initWebSocket(wss);

app.set('broadcast', broadcast);
