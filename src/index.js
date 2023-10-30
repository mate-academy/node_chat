/* eslint-disable no-console */
'use strict';

require('dotenv/config');

const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
// const messageService = require('./services/messages.service');
const { chatRouter } = require('./routes/chat.route');
const { Messages } = require('./models/messages');
const { Chats } = require('./models/chats');

const PORT = process.env.PORT;

const app = express();
const server = app.listen(PORT);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use('/chats', chatRouter);

const clientsByRoom = {};
let roomId = null;

wss.on('connection', (ws) => {
  ws.on('message', async(data) => {
    const sendedData = JSON.parse(data);

    console.log(sendedData);

    switch (sendedData.type) {
      case 'chatId':
        roomId = sendedData.id;

        if (!clientsByRoom[roomId]) {
          clientsByRoom[roomId] = [];
        }

        clientsByRoom[roomId].push(ws);
        break;

      case 'chat':
        const { chatAuthor, name } = sendedData;

        const newChat = await Chats.create({
          name,
          chatAuthor,
        });

        for (const client of wss.clients) {
          client.send(JSON.stringify({
            type: sendedData.type,
            newChat,
          }));
        }
        break;

      case 'message':
        const { author, text, chatId } = sendedData;

        const newMessage = await Messages.create({
          author,
          text: text.toString(),
          chatId,
        });

        const roomClients = clientsByRoom[chatId] || [];

        for (const client of roomClients) {
          console.log('this is data type', sendedData.type);

          client.send(JSON.stringify({
            type: sendedData.type,
            newMessage,
          }));
        }
        break;
    }
  });

  ws.on('close', () => {
    if (!roomId) {
      return;
    }

    clientsByRoom[roomId] = clientsByRoom[roomId]
      .filter((client) => client !== ws);
  });
});
