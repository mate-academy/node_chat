'use strict';

const express = require('express');
const cors = require('cors');

const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { usersRouter } = require('./routes/users.route');
const { roomsRouter } = require('./routes/rooms.route');
const { messagesRouter } = require('./routes/messages.route');

function createServer() {
  const app = express();

  /* CORS  */
  const options = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE , PATCH',
    allowedHeaders: 'Content-Type',
    credentials: true,
  };

  app.use(cors(options), express.json());

  /* ROUTES */
  app.use('/users', usersRouter);
  app.use('/rooms', roomsRouter);
  app.use('/messages', messagesRouter);

  app.use(errorMiddleware);

  return app;
}

module.exports = {
  createServer,
};
