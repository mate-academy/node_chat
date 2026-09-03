'use strict';

const { WebSocketServer, WebSocket } = require('ws');

let wss = null;

function initRealtime(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`Client connected (total: ${wss.clients.size})`);

    socket.on('close', () => {
      // eslint-disable-next-line no-console
      console.log(`Client disconnected (total: ${wss.clients.size})`);
    });
  });
}

function broadcast(event, payload) {
  if (!wss) {
    return;
  }

  const data = JSON.stringify({ event, payload });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

module.exports = { initRealtime, broadcast };
