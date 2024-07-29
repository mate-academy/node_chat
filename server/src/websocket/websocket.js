const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });

module.exports = wss;
