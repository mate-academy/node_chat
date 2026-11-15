import { WebSocket, WebSocketServer } from 'ws';
import { chatStore } from '../models/chatStore.js';

export function attachChatWebSocket(server) {
  const webSocketServer = new WebSocketServer({ server });

  webSocketServer.on('connection', (socket, req) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const roomId = requestUrl.searchParams.get('roomId');
    const userName = requestUrl.searchParams.get('userName');

    if (!roomId || !userName) {
      socket.close(1008, 'roomId and userName are required');

      return;
    }

    socket.roomId = roomId;
    socket.on('error', () => socket.close());

    socket.on('message', (data) => {
      chatStore.addMessage(data.toString(), roomId, userName);
    });
  });

  chatStore.on('message', (message) => {
    for (const client of webSocketServer.clients) {
      if (
        client.roomId === message.roomId &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(JSON.stringify(message));
      }
    }
  });

  chatStore.on('room-deleted', (roomId) => {
    for (const client of webSocketServer.clients) {
      if (client.roomId === roomId) {
        client.close(1000, 'Room deleted');
      }
    }
  });

  return webSocketServer;
}
