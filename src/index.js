'use strict';

require('dotenv/config');

const uuidv4 = require('uuid').v4;

const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const PORT = process.env.PORT || 3005;

const app = express();
const server = app.listen(PORT);
const wss = new WebSocket.Server({ server });

app.use(cors());

wss.on('connection', (ws) => {
  ws.on('message', (messageText) => {
    const message = {
      id: uuidv4(),
      text: messageText.toString(),
      time: Date.now(),
    };

    for (const client of wss.clients) {
      client.send(JSON.stringify(message));
    }
  });
});
