const { WebSocketServer } = require('ws');
const { emitter } = require('../helpers/eventEmiitter');
const { getAllMessages } = require('../models/message.models');
const { debounce } = require('../helpers/debounce');

function setupWebSocket(server) {
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
}

module.exports = { setupWebSocket };
