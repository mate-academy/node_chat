/* eslint-disable no-console */
const WebSocket = require('ws');
const { rooms } = require('./store');
const { handleMessage } = require('./handlers');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('connection', (ws) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.send(
      JSON.stringify({
        type: 'ROOMS_LIST',
        rooms: Object.values(rooms).map((r) => ({ id: r.id, name: r.name })),
      }),
    );

    ws.on('message', (msg) => {
      try {
        handleMessage(ws, wss, msg);
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });

    ws.on('close', () => {
      ws.roomId = null;
    });
  });

  wss.on('close', () => clearInterval(interval));

  return wss;
}

module.exports = { setupWebSocket };
