/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { userRouter } = require('./routes/user.route.js');
const { roomRouter } = require('./routes/room.route.js');
const { websocket } = require('./websocket/websocket.js');
const { errorMiddleware } = require('./middlewares/errorMiddleware.js');

require('dotenv').config();

const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('/user', userRouter);
app.use('/room', roomRouter);

const server = app.listen(PORT, () => {
  console.log('Server is running on port: ', PORT);
});

const wss = new WebSocketServer({ server });

websocket(wss);

app.use(errorMiddleware);
