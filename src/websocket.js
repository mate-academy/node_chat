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

  wss.on('close', function close() {
    clearInterval(interval);
  });

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

    ws.on('message', (message) => handleMessage(ws, wss, message));

    ws.on('close', () => {
      ws.roomId = null;
    });
  });

  return wss;
}

module.exports = { setupWebSocket };
