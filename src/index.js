'use strict';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { Message } from './models/Messages.js';
import { usernameRouter } from './routes/usernames.router.js';
import { messageRouter } from './routes/message.route.js';

const emitter = new EventEmitter();

const PORT = process.env.PORT || 3001;

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(usernameRouter);
app.use(messageRouter);

app.post('/messages', async (req, res) => {
  const { text, author, chatName } = req.body;

  const message = await Message.create({
    text,
    author,
    chatName,
  });

  emitter.emit('message', message);

  res.status(201).send(message);
});

const server = app.listen(PORT);

const wss = new WebSocketServer({ server });

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});
