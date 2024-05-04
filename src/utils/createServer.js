'use strict';

const express = require('express');
const cors = require('cors');

const { authRouter } = require('../routers/auth.router');
const { roomRouter } = require('../routers/rooms.router');
const { directRouter } = require('../routers/direct.router');
const { messageRouter } = require('../routers/message.router');
const { errorMiddleware } = require('../middlewares/errorMiddleware');

require('dotenv').config();

function createServer() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_HOST,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use('/authorize', authRouter);
  app.use('/rooms', roomRouter);
  app.use('/directs', directRouter);
  app.use('/messages', messageRouter);

  app.use(errorMiddleware);

  return app;
}

module.exports = {
  createServer,
};
