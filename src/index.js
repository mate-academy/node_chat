'use strict';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { roomRouter } from './routes/room.route.js';
import { userRouter } from './routes/user.route.js';
import { handleMessage } from './controllers/chat.controller.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/', roomRouter);
app.use('/', userRouter);

const server = app.listen(PORT, () => {});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (msg) => handleMessage(ws, msg, wss));

  ws.on('close', () => {});
});
