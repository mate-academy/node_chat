import { WebSocketServer, WebSocket } from 'ws';
import { validate as isUuid } from 'uuid';
import { roomsService } from './services/rooms.service.js';

let wss;

function send(socket, event, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, payload }));
  }
}

export function initRealtime(server) {
  wss = new WebSocketServer({
    server,
    maxPayload: 4096,
  });

  wss.on('connection', (socket) => {
    socket.roomId = null;
    socket.joinVersion = 0;

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.on('message', async (data) => {
      try {
        let message;

        try {
          message = JSON.parse(data.toString());
        } catch {
          send(socket, 'error', { message: 'Invalid JSON' });

          return;
        }

        if (!message || message.event !== 'join') {
          send(socket, 'error', { message: 'Unknown event' });

          return;
        }

        // Захищає від накладання кількох асинхронних join-запитів.
        const version = ++socket.joinVersion;
        socket.roomId = null;

        if (!isUuid(message.roomId)) {
          send(socket, 'error', { message: 'Invalid room id' });

          return;
        }

        const room = await roomsService.getById(message.roomId);

        if (
          version !== socket.joinVersion ||
          socket.readyState !== WebSocket.OPEN
        ) {
          return;
        }

        if (!room) {
          send(socket, 'error', { message: 'Room not found' });

          return;
        }

        socket.roomId = room.id;

        send(socket, 'joined', { roomId: room.id });
      } catch (error) {
        console.error('WebSocket handler failed:', error);
        send(socket, 'error', { message: 'Internal server error' });
      }
    });
  });
}

export function broadcastToRoom(roomId, event, payload) {
  if (!wss) {
    return;
  }

  for (const socket of wss.clients) {
    if (socket.roomId === roomId) {
      send(socket, event, payload);
    }
  }
}
