'use strict';

const express = require('express');
const cors = require('cors');
const chatsRouter = require('./routes/chats.router');
const messagesRouter = require('./routes/messages.router');

function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(chatsRouter);
  app.use(messagesRouter);

  return app;
}

module.exports = {
  createServer,
};
