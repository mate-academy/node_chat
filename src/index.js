'use strict';

import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { emitter } from './controllers/message.controller.js';
import { messagesRoute } from './routes/messages.route.js';
import { roomsRoute } from './routes/room.route.js';
import { Room } from './models/Room.models.js';
import { Message } from './models/Message.model.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/messages', messagesRoute);
app.use('/rooms', roomsRoute);

const server = app.listen(3005);

Room.sync();
Message.sync();

const wss = new WebSocketServer({ server });

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
});
