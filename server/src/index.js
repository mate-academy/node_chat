'use strict';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { authRouter } from './routes/auth.route.js';
import { uuid as v4 } from 'uuidv4';
import { roomsRouter } from './routes/rooms.route.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { roomsService } from './services/rooms.service.js';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/users', authRouter);
app.use('/rooms', authMiddleware, roomsRouter);

const messages = [];
const server = app.listen(PORT, () => {});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.roomId = 'general';

  ws.send(
    JSON.stringify({ type: 'HISTORY', data: messages, roomId: ws.roomId }),
  );

  ws.on('message', (message) => {
    const result = JSON.parse(message);

    const { text, author, type, roomId } = result;

    if (type === 'JOIN_ROOM' && roomId) {
      const room = roomsService.getRoomById(roomId);

      if (roomId === 'general') {
        ws.roomId = 'general';

        return;
      }

      if (!room) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Not found' }));

        return;
      }

      const isMember = room.members.some((member) => member.name === author);

      if (!isMember) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Forbidden' }));

        return;
      }

      ws.roomId = roomId;
      ws.send(JSON.stringify({ type: 'HISTORY', data: room.messages }));

      return;
    }

    const messageId = v4();

    const newMessage = {
      text,
      author,
      id: messageId,
      time: new Date().toISOString(),
      roomId: ws.roomId,
    };

    if (ws.roomId === 'general') {
      messages.push(newMessage);
    } else {
      const room = roomsService.getRoomById(ws.roomId);

      room.messages.push(newMessage);
    }

    const clients = wss.clients;

    for (const client of clients) {
      if (client.readyState === 1 && client.roomId === ws.roomId) {
        client.send(
          JSON.stringify({
            data: newMessage,
            type: 'NEW_MESSAGE',
            roomId: ws.roomId,
          }),
        );
      }
    }
  });
});
