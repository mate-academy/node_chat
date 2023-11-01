/* eslint-disable no-console */
'use strict';

require('dotenv/config');

const express = require('express');
const cors = require('cors');

const WebSocket = require('ws');
const { chatRouter } = require('./routes/chat.route');
const { createMessage } = require('./services/messages.service');
const { createChat, deleteChat } = require('./services/chat.service');

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
    const { type, chatId, id } = sendedData;

    console.log(sendedData);

    switch (type) {
      case 'chatId':
        roomId = id;

        if (!clientsByRoom[roomId]) {
          clientsByRoom[roomId] = [];
        }

        clientsByRoom[roomId].push(ws);
        break;

      case 'chat':
        const newChat = await createChat(sendedData);

        for (const client of wss.clients) {
          client.send(JSON.stringify({
            type,
            newChat,
          }));
        }
        break;

      case 'deleteChat':
        deleteChat(chatId);

        if (clientsByRoom[chatId]) {
          delete clientsByRoom[chatId];
        }

        for (const client of wss.clients) {
          client.send(JSON.stringify({
            type,
            chatId,
          }));
        }
        break;

      case 'renameChat':
        break;

      case 'message':
        const newMessage = createMessage(sendedData);
        const roomClients = clientsByRoom[chatId] || [];

        for (const client of roomClients) {
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
