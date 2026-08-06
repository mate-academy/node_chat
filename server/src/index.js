'use strict';

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { registerUserController } = require('./controllers/users.controller');
const { registerRoomsController } = require('./controllers/rooms.controller');
const {
  registerMessagesController,
} = require('./controllers/messages.controller');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5174',
  },
});

io.on('connection', (socket) => {
  // eslint-disable-next-line no-console
  console.log('Client connected');

  registerUserController(socket);
  registerRoomsController(io, socket);
  registerMessagesController(io, socket);

  socket.on('disconnect', () => {
    // eslint-disable-next-line no-console
    console.log('Client disconnected');
  });
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});
