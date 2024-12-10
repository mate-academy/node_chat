'use strict';
/* eslint-disable no-unused-expressions */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { authRoute } = require('./routes/auth.route');
const { errorMiddleware } = require('./middlewares/errorMiddleware');
const { userRoute } = require('./routes/users.route');
const cookieParser = require('cookie-parser');
const { roomsRoute } = require('./routes/rooms.route');
const { messageRouter } = require('./routes/message.route');
const { messageEmitter } = require('./controllers/messanger.controller');

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Node chat app!');
});

app.use('/', authRoute);
app.use('/users', userRoute);
app.use('/rooms', roomsRoute);
app.use('/messages', messageRouter);

app.use((req, res) => {
  res.sendStatus(404);
});

app.use(errorMiddleware);

const server = app.listen(process.env.PORT || 3006, () => {
  /* eslint-disable no-console */
  console.log(
    `Server is running on http://localhost:${process.env.PORT || 3006}`,
  );
});

const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  console.log('A new client!');

  client.on('message', (data) => {
    client.send('Data received');
  });
});

messageEmitter.on('message', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(data));
  }
});
