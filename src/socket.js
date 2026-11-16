'use strict';

const ws = require('ws');

function initSocket(server) {
  const wss = new ws.WebSocketServer({ server });

  wss.on('connection', (clients) => {
    clients.on('message', (data) => {
      for (const client of wss.clients) {
        client.send(data.toString());
      }
    });
  });
}

module.exports = initSocket;
