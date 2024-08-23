/* eslint-disable no-console */
'use strict';

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

require('dotenv').config();

const userRouter = require('./routes/user.route');
const messageRouter = require('./routes/message.route');
const roomRouter = require('./routes/room.route');
const { errorMiddleware } = require('./middleware/error.middleware');
const { emitter } = require('./controllers/message.controller');
// const db = require('./db/models');

const PORT = process.env.PORT || 10000;
const app = express();

// db.sequelize.sync({ force: true });

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_HOST,
    credentials: true,
  }),
);

app.use('users', userRouter);
app.use('messages', messageRouter);
app.use('rooms', roomRouter);

app.use((req, res) => {
  res.status(404).send('Page not found');
});
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const wss = new WebSocketServer({ server });

emitter.on('message', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(data));
  }
});
