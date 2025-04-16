const { WebSocket } = require('ws');

const broadcastMessage = (wss, message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

module.exports = {
  broadcastMessage,
};
