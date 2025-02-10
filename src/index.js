/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');

require('dotenv').config();

const { userRoute } = require('./routes/user.route');
const { roomRoute } = require('./routes/room.route');
const { messageRoute } = require('./routes/message.route');
const { WebSocketServer } = require('ws');
const { Message } = require('./models/Message');
const messageEmitter =
  require('./controllers/message.controller').messageEmitter;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
  }),
);

app.use(express.json());

app.use('/users', userRoute);
app.use('/rooms', roomRoute);
app.use(messageRoute);

const server = app.listen(PORT, () => {
  console.log('server is running');
});

const wss = new WebSocketServer({ server });

const rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { roomId } = JSON.parse(message);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push(ws);

    const messages = await Message.findAll({ where: { roomId } });

    messages.forEach((msg) => {
      ws.send(JSON.stringify(msg));
    });
  });

  ws.on('close', () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((client) => client !== ws);
    }
  });
});

messageEmitter.on('message', async (message) => {
  const { roomId } = message;

  if (rooms[roomId]) {
    rooms[roomId].forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  }
});
