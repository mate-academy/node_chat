const express = require('express');
const WebSocketServer = require('wss');

const { messagesRoute } = require('./routes/messages.route.js');
const { websocketEmitter } = require('./websocket.js');

const app = express();

app.use(express.json());

app.use(messagesRoute);

app.get('/', (req, res) => {
  res.send('hello');
});

const server = app.listen(3005);

const wss = new WebSocketServer({ server });

websocketEmitter.on('newMessage', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});
