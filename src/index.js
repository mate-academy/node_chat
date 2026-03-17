'use strict';

const express = require('express');
const cors = require('cors');
// const events = require('events');
const { setupAssociations } = require('./setup');
const { router: roomRouter } = require('./routes/room.route');
const { WebSocketServer } = require('ws');
const { Message } = require('./models/message.model');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
setupAssociations();

app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
);

app.use('/rooms', roomRouter);

const server = app.listen(PORT, () => {});
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const message = JSON.parse(data);

    handleMessage(ws, message);
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

async function handleMessage(ws, data) {
  switch (data.type) {
    case 'join':
      clients.set(ws, {
        userId: data.userId,
        roomId: data.roomId,
      });

      const history = await Message.findAll({
        where: { roomId: data.roomId },
      });

      ws.send(
        JSON.stringify({
          type: 'history',
          messages: history,
        }),
      );

      break;

    case 'message':
      const client = clients.get(ws);

      const newMessage = await Message.create({
        authorId: client.userId,
        roomId: client.roomId,
        text: data.text,
        time: new Date(),
      });

      broadcast(client.roomId, newMessage);

      break;
  }
}

function broadcast(roomId, message) {
  for (const [client, info] of clients) {
    if (info.roomId === roomId) {
      client.send(
        JSON.stringify({
          type: 'message',
          message,
        }),
      );
    }
  }
}
