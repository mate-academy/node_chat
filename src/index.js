'use strict';

require('dotenv/config');

const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const chatService = require('./services/chat.service');
const messageService = require('./services/messages.service');
const { chatRouter } = require('./routes/chat.route');

const PORT = process.env.PORT;

const app = express();
const server = app.listen(PORT);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(chatRouter);

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    messageService.messagesWS(wss, message);
  });

  ws.on('chat', (name, authorChat) => {
    chatService.createChat(name, authorChat);
  });
});
