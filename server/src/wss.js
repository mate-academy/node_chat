const { WebSocketServer } = require('ws');

let wss;

function initializeWSS(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('[WebSocket] New client connected');

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
    });
  });

  return wss;
}

function getWSS() {
  if (!wss) {
    throw new Error(
      'WebSocketServer is not initialized. Call initializeWSS first.',
    );
  }
  return wss;
}

module.exports = { initializeWSS, getWSS };
