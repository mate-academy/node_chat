'use strict';

const ws = require('ws');

function initSocket(server) {
  const wss = new ws.WebSocketServer({ server });

  wss.on('connection', (clients) => {
    clients.on('message', (data) => {
      const { author, text } = JSON.parse(data.toString());
      const message = { author, text, time: new Date() };

      for (const client of wss.clients) {
        client.send(JSON.stringify(message));
      }
    });
  });
}

module.exports = initSocket;
