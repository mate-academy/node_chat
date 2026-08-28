import { WebSocketServer, WebSocket } from 'ws';

// A single WebSocket server, shared across the app.
let wss = null;

// Attach a WebSocket server to the existing HTTP server.
// WebSocket runs over HTTP, so we reuse the same server (and port).
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

// Send an event to EVERY connected client.
// The client decides what to do with it (e.g. only show messages
// for the room it is currently viewing).
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
