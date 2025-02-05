/* eslint-disable no-console */
'use strict';

require('dotenv').config();

const PORT = process.env.PORT || 3005;
const express = require('express');
const cors = require('cors');
const EventEmitter = require('events');
const { WebSocketServer, WebSocket } = require('ws');
const { userRouter } = require('./server/routes/user.route.js');
const { roomRouter } = require('./server/routes/room.route.js');
const { messageService } = require('./server/services/message.service.js');

const app = express();

app.use(cors());
app.use(express.json());

const emitter = new EventEmitter();

app.use('/', userRouter);
app.use('/rooms', roomRouter);

app.post('/room/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  const { userId, text } = req.body;

  const newMessage = await messageService.addMessage(userId, roomId, text);

  const messages = await messageService.getMessagesByRoom(roomId);

  emitter.emit('message', newMessage);

  res.status(201).send(messages);
});

app.get('/room/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await messageService.getMessagesByRoom(roomId);

    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = app.listen(PORT);

const wss = new WebSocketServer({ server });

const rooms = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === 'subscribe' && message.roomId) {
        if (!rooms.has(message.roomId)) {
          rooms.set(message.roomId, new Set());
        }

        rooms.get(message.roomId).add(ws);
      }
    } catch (error) {
      console.error('Invalid WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    // eslint-disable-next-line no-unused-vars
    for (const [roomId, clients] of rooms) {
      clients.delete(ws);
    }
  });
});

emitter.on('message', (message) => {
  const clients = rooms.get(message.roomId) || new Set();

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
});
