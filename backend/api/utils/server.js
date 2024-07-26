const express = require('express');
const cors = require('cors');
const { usersRouter } = require('../routes/users.route');
const { initTables } = require('../models/models');
const { roomRouter } = require('../routes/rooms.route');
const { messageRouter } = require('../routes/message.route');
const EventEmitter = require('events');
const { WebSocketServer } = require('ws');

const dotenv = require('dotenv');
const { messageServices } = require('../services/message.service');

dotenv.config();

const app = express();
const server = app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server running on port: ${process.env.SERVER_PORT}`);
});

const wss = new WebSocketServer({ server });
const emitter = new EventEmitter();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    switch (message.event) {
      case 'message':
        broadcastMessage(JSON.parse(message));
        break;

      case 'connection':
        broadcastMessage(JSON.parse(message));
        break;
    }
  });

  ws.on('close', () => {
    wss.close();
  });
});

const broadcastMessage = (message) => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
};

initTables();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use('/users', usersRouter);
app.use('/rooms', roomRouter);
app.use('/message', messageRouter);

module.exports = {
  wss,
  server,
  emitter,
  app,
};
