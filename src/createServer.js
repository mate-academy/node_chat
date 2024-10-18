const express = require('express');
const cors = require('cors');
const { messageRouter } = require('./routers/message.router');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { roomRouter } = require('./routers/room.router');

const createServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/message', messageRouter);
  app.use('/room', roomRouter);
  app.use(errorMiddleware);

  return app;
};

module.exports = {
  createServer,
};
