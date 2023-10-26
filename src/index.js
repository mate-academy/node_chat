'use strict';

require('dotenv/config');

const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const messageService = require('./services/messages.service');
const { chatRouter } = require('./routes/chat.route');

const PORT = process.env.PORT;

const app = express();
const server = app.listen(PORT);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use('/chats', chatRouter);

wss.on('connection', (ws, req) => {
  ws.on('message', (message) => {
    messageService.messagesWS(wss, message);
  });
});
