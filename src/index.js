'use strict';
const cors = require('cors');
const express = require('express');
const { WebSocketServer } = require('ws');

const messagesRouter = require('./routes/messages.route');
const usersRouter = require('./routes/users.route');
const roomsRouter = require('./routes/rooms.route');
const { Message } = require('./models/Message.model');
const { User } = require('./models/User.model');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', usersRouter);
app.use('/messages', messagesRouter);
app.use('/rooms', roomsRouter);

const server = app.listen(3005);

const wss = new WebSocketServer({ server });

wss.on('connection', socket => {
  socket.on('message', async raw => {
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return socket.send(JSON.stringify({ error: 'Invalid JSON' }));
    }

    const { roomId, authorId, text } = data;

    if (!roomId || !authorId || !text) {
      return socket.send(
        JSON.stringify({ error: 'roomId, authorId and text required' }),
      );
    }

    socket.roomId = roomId;

    const created = await Message.create({ roomId, authorId, text });

    const message = await Message.findByPk(created.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username'],
        },
      ],
    });

    const payload = JSON.stringify(message);

    for (const client of wss.clients) {
      if (
        client.readyState === client.OPEN &&
        client.roomId === message.roomId
      ) {
        client.send(payload);
      }
    }
  });
});
