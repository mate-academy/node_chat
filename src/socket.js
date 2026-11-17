'use strict';

const ws = require('ws');

function initSocket(server) {
  const wss = new ws.WebSocketServer({ server });
  const messages = [];

  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'history', messages: messages }));

    socket.on('message', (data) => {
      const { author, text } = JSON.parse(data.toString());
      const message = { author, text, time: new Date() };

      messages.push(message);

      for (const client of wss.clients) {
        client.send(JSON.stringify({ type: 'message', message: message }));
      }
    });
  });
}

module.exports = initSocket;
