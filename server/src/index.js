/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');
const { userRouter } = require('./routes/user.route');
const { roomRouter } = require('./routes/room.route');
const { messageRouter } = require('./routes/message.route');
const http = require('http');
const WebSocket = require('ws');
const wss = require('./websocket/websocket');

require('dotenv').config();

const PORT = process.env.PORT || 3005;

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json());

app.use('/user', userRouter);
app.use('/room', roomRouter);
app.use('/message', messageRouter);

wss.on('connection', (ws) => {
  console.log('a user connected');

  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('user disconnected');
  });
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

server.listen(PORT, () => {
  console.log('Server is running on port: ', `${PORT}`);
});
