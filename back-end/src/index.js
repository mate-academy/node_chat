'use strict';

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { chatRouter } = require('./routes/chat.route');
const { userRouter } = require('./routes/user.route');
const { messageRouter } = require('./routes/message.route');
const emitter = require('./utils/eventEmiter');
const PORT = 3005;

const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', userRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);

const server = app.listen(PORT);

const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    const { event, chatId } = JSON.parse(data.toString());

    if (event === 'joinChat') {
      clients.set(socket, chatId);
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
  });
});

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    if (client.readyState === 1 && clients.get(client) === message.chatId) {
      client.send(JSON.stringify(message));
    }
  }
});

// app.use((err, req, res, next) => {
//   console.error('Server error:', err);

//   if (res.headersSent) {
//     return next(err);
//   }

//   return res.status(500).json({
//     message: 'Internal server error',
//   });
// });
