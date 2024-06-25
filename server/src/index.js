('use strict');

const http = require('http');
const { WebSocketServer } = require('ws');

require('dotenv').config();

const EventEmitter = require('events');

const app = require('./app');

const emitter = new EventEmitter();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});
