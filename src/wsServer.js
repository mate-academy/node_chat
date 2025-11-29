// wsServer.js
import { WebSocketServer } from 'ws';

let wss = null;

export function initWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected.');

    ws.on('close', () => console.log('Client disconnected.'));
  });

  return wss;
}

export function broadcast(type, payload) {
  if (!wss) return;

  const message = JSON.stringify({ type, payload });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}
