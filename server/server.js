import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

import dotenv from 'dotenv/config';

const PORT = process.env.PORT || 3001;

export const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // rooms: Map<roomId, { id, name, messages[], clients: Set<ws> }>
  const rooms = new Map();

  // Create a default "General" room
  const defaultRoomId = randomUUID();

  rooms.set(defaultRoomId, {
    id: defaultRoomId,
    name: 'General',
    messages: [],
    clients: new Set(),
  });

  // Helper: get serializable room list (without clients Set)
  const getRoomsList = () =>
    [...rooms.values()].map(({ id, name, messages }) => ({
      id,
      name,
      messageCount: messages.length,
    }));

  // Helper: broadcast to all clients in a room
  const broadcastToRoom = (roomId, payload) => {
    const room = rooms.get(roomId);

    if (!room) {
      return;
    }

    const data = JSON.stringify(payload);

    room.clients.forEach((client) => {
      if (client.readyState === 1 /* OPEN */) {
        client.send(data);
      }
    });
  };

  // Helper: broadcast to ALL connected clients
  const broadcastToAll = (wss, payload) => {
    const data = JSON.stringify(payload);

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(data);
      }
    });
  };

  app.use('{*path}', (req, res) => {
    res.status(404).send('Not Found');
  });

  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err);

    if (res.headersSent) {
      return next(err);
    }

    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Something went wrong!';

    res.status(statusCode).send(message);
  });

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
  });

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    // Each client has: username, currentRoomId
    ws.username = null;
    ws.currentRoomId = null;

    ws.on('message', (raw) => {
      let payload;

      try {
        payload = JSON.parse(raw.toString());
      } catch {
        return;
      }

      const { type } = payload;

      switch (type) {
        // ─── Username ───────────────────────────────────────────────────
        case 'set_username': {
          ws.username =
            String(payload.username).trim().slice(0, 32) || 'Anonymous';

          // Send current rooms list so client can pick one
          ws.send(
            JSON.stringify({
              type: 'rooms_list',
              rooms: getRoomsList(),
            }),
          );
          break;
        }

        // ─── Create Room ────────────────────────────────────────────────
        case 'create_room': {
          const roomName = String(payload.name || 'New Room')
            .trim()
            .slice(0, 64);
          const roomId = randomUUID();

          rooms.set(roomId, {
            id: roomId,
            name: roomName,
            messages: [],
            clients: new Set(),
          });

          broadcastToAll(wss, {
            type: 'rooms_list',
            rooms: getRoomsList(),
          });
          break;
        }

        // ─── Join Room ──────────────────────────────────────────────────
        case 'join_room': {
          const { roomId } = payload;

          // Leave current room
          if (ws.currentRoomId) {
            const prev = rooms.get(ws.currentRoomId);

            if (prev) {
              prev.clients.delete(ws);
            }
          }

          const room = rooms.get(roomId);

          if (!room) {
            ws.send(
              JSON.stringify({ type: 'error', message: 'Room not found' }),
            );
            break;
          }

          room.clients.add(ws);
          ws.currentRoomId = roomId;

          // Send full message history to the newly joined client
          ws.send(
            JSON.stringify({
              type: 'history',
              roomId,
              messages: room.messages,
            }),
          );
          break;
        }

        // ─── Rename Room ─────────────────────────────────────────────────
        case 'rename_room': {
          const room = rooms.get(payload.roomId);

          if (!room) {
            break;
          }

          room.name = String(payload.name || room.name)
            .trim()
            .slice(0, 64);

          broadcastToAll(wss, {
            type: 'rooms_list',
            rooms: getRoomsList(),
          });
          break;
        }

        // ─── Delete Room ─────────────────────────────────────────────────
        case 'delete_room': {
          const room = rooms.get(payload.roomId);

          if (!room) {
            break;
          }

          // Notify members of deletion
          broadcastToRoom(payload.roomId, {
            type: 'room_deleted',
            roomId: payload.roomId,
          });

          // Disconnect members from room
          room.clients.forEach((client) => {
            client.currentRoomId = null;
          });

          rooms.delete(payload.roomId);

          broadcastToAll(wss, {
            type: 'rooms_list',
            rooms: getRoomsList(),
          });
          break;
        }

        // ─── Chat Message ─────────────────────────────────────────────────
        case 'chat_message': {
          const room = rooms.get(ws.currentRoomId);

          if (!room) {
            ws.send(
              JSON.stringify({ type: 'error', message: 'Join a room first' }),
            );
            break;
          }

          const message = {
            id: randomUUID(),
            author: ws.username || 'Anonymous',
            text: String(payload.text || '').trim(),
            createdAt: new Date().toISOString(),
          };

          if (!message.text) {
            break;
          }

          room.messages.push(message);

          broadcastToRoom(ws.currentRoomId, {
            type: 'chat_message',
            roomId: ws.currentRoomId,
            message,
          });
          break;
        }

        default:
          break;
      }
    });

    ws.on('close', () => {
      if (ws.currentRoomId) {
        const room = rooms.get(ws.currentRoomId);

        if (room) {
          room.clients.delete(ws);
        }
      }
    });
  });
};
