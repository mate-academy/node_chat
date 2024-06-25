('use strict');
require('dotenv').config();

const http = require('http');
const { WebSocketServer } = require('ws');

const app = require('./app');
const { debounce } = require('./helpers/debounce');
const { getAllMessages } = require('./models/message.models');
const { emitter } = require('./helpers/eventEmiitter');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

const broadcastMessages = debounce((message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});

emitter.on('message', (message) => {
  broadcastMessages(message);
});

wss.on('connection', (connection) => {
  connection.send(JSON.stringify(getAllMessages()));
});
