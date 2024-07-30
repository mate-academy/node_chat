const express = require('express');
const cors = require('cors');
const { roomsRouter  } = require('../routes/rooms.router');
const { Room } = require('../models/Room.model');
const { Message } = require('../models/Message.model');
const { messagesRouter } = require('../routes/messages.router');

const createServer = () => {
  const app = express();

  Room.sync({ alter: true });
  Message.sync({ alter: true })

  app.use(express.json());
  app.use(cors(

  ));

  app.use('/rooms', roomsRouter);
  app.use('/messages', messagesRouter);

  return app;
};


module.exports = {
  createServer,
}