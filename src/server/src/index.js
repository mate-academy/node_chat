/* eslint-disable no-console */
'use strict';
import 'dotenv/config';
import cors from 'cors';
import { EventEmitter } from 'events';
import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import { errorMiddleware } from './middlewares/errorMiddleWare.js';
import { messagesRouter } from './routes/messages.route.js';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors());
app.use(errorMiddleware);
app.use('/messages', messagesRouter);

app.use((req, res) => {
  res.status(404).send('Error 404: Page not found');
});

const server = app.listen(PORT);
const wss = new WebSocketServer({ server });

export const emitter = new EventEmitter();

// 1
emitter.on('message', (data) => {
  const { room, text } = data;

  console.log('room', room);

  for (const client of wss.clients) {
    console.log('client.room', client.room);

    if (client.room === room) {
      client.send(JSON.stringify({ text }));
    }
  }
});
