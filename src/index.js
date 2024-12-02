'use strict';

require('dotenv/config');

const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const UserController = require('./controllers/User.controller.js');
const RoomController = require('./controllers/Room.controller.js');
const MessageController = require('./controllers/Message.controller.js');
const registerUserHandlers = require('./handlers/User.handler.js');
const registerMessageHandlers = require('./handlers/Message.handler.js');
const registerRoomHandlers = require('./handlers/Room.handler.js');
const vars = require('./vars.js');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/users', UserController.getAll);
app.get('/rooms', RoomController.getAll);
app.get('/messages/:id', MessageController.getAllByRoomId);

app.use((error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error);
  res.sendStatus(500);
});

const server = app.listen(vars.PORT);
const io = new Server(server, {
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
  },
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  },
});

const onConnection = (socket) => {
  if (socket.recovered) {
    // eslint-disable-next-line no-console
    console.log(`User ${socket.id} reconnected`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`User ${socket.id} connected`);
  }

  registerUserHandlers(io, socket);
  registerMessageHandlers(io, socket);
  registerRoomHandlers(io, socket);
};

io.on('connection', onConnection);
