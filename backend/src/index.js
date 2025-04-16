'use strict';

const express = require('express');
const cors = require('cors');
const userRouter = require('./api/routes/user.router');
const errorMiddleware = require('./middlewares/errorMiddleware');
const messageRouter = require('./api/routes/message.router');
const { setupWebSocket } = require('./ws/server');

require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/users', userRouter);
app.use('/messages', messageRouter);

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Server running on port ${PORT}\nYou can access the server at http://localhost:${PORT}`,
  );
});

setupWebSocket(server);
