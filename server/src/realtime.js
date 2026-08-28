import { WebSocketServer, WebSocket } from 'ws';

let wss = null;

export function initRealtime(server) {
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

export function broadcast(type, payload) {
  if (!wss) {
    return;
  }

  const data = JSON.stringify({ type, payload });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}
