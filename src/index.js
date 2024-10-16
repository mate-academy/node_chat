'use strict';

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { roomRouter } from './routes/room.route.js';
import { messageRouter } from './routes/message.route.js';
import path from 'path';
import { WebSocketServer } from 'ws';
import { wsController } from './controllers/ws.controller.js';
import { roomUsers } from './utils/roomUsers.js';

const PORT = process.env.PORT || 3005;
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(express.static(path.resolve('public')));

app.use(roomRouter);
app.use(messageRouter);
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  process.stdout.write(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, client) => {
  ws.on('error', process.stdout.write('wss error connection\n'));

  ws.on('message', async (data) => {
    await wsController.handleWebSocketMessage(ws, data, wss);
  });

  ws.on('close', () => {
    roomUsers.userLeave(ws.userName, ws.roomName);

    wsController.broadcastMessage(
      JSON.stringify({
        message: 'Ok',
        data: {
          id: '0',
          userName: 'admin',
          text: `${ws.userName} left chat`,
          time: new Date().toISOString(),
          roomName: ws.roomName,
          roomUsers: roomUsers.getRoomUsers(ws.roomName),
        },
      }),
      ws,
      ws.roomName,
      wss,
    );
  });
});
