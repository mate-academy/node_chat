/* eslint-disable no-console */
'use strict';
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { WebSocketServer } from 'ws';
import EventEmitter from 'node:events';

import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { usersRouter } from './routes/users.router.js';
import { roomsRouter } from './routes/rooms.router.js';
import { messagesRouter } from './routes/messages.router.js';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use('/users', usersRouter);
app.use('/rooms', roomsRouter);
app.use('/room', messagesRouter);

app.use(errorMiddleware);

const server = app.listen(PORT, () => console.log('Server is running'));

const wss = new WebSocketServer({ server });

export const messageEmitter = new EventEmitter();

wss.on('connection', (ws) => {
  ws.rooms = new Set();

  ws.on('message', (message) => {
    let data;

    try {
      data = JSON.parse(message.toString());
    } catch (error) {
      console.log(error);

      return;
    }

    switch (data.type) {
      case 'subscribe':
        ws.rooms?.add(String(data.roomId));
        ws.userId = data.userId;
        break;

      case 'unsubscribe':
        ws.rooms?.delete(String(data.roomId));
        break;
    }
  });
});

messageEmitter.on('message', (data) => {
  for (const client of wss.clients) {
    const ws = client;

    if (ws.rooms?.has(String(data.roomId))) {
      ws.send(JSON.stringify({ type: 'message', payload: data }));
    }
  }
});

messageEmitter.on('room_leaved', (data) => {
  for (const client of wss.clients) {
    const ws = client;

    if (String(ws.userId) === String(data.userId)) {
      ws.send(
        JSON.stringify({
          type: 'room_deleted',
          payload: { id: data.roomId },
        }),
      );
    } else if (ws.rooms?.has(String(data.roomId))) {
      ws.send(
        JSON.stringify({
          type: 'user_left_room',
          payload: {
            userId: data.userId,
            roomId: data.roomId,
          },
        }),
      );
    }
  }
});

messageEmitter.on('rooms_updated', () => {
  for (const client of wss.clients) {
    client.send(JSON.stringify({ type: 'rooms_updated' }));
  }
});

messageEmitter.on('room_deleted', (data) => {
  for (const client of wss.clients) {
    client.send(
      JSON.stringify({
        type: 'room_deleted',
        payload: data,
      }),
    );
  }
});

messageEmitter.on('room_updated', (data) => {
  for (const client of wss.clients) {
    client.send(
      JSON.stringify({
        type: 'room_updated',
        payload: data,
      }),
    );
  }
});
