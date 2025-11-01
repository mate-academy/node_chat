'use strict';
import express from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

const rooms = new Map();

rooms.set('general', {
  name: 'General',
  messages: [],
  users: new Set(),
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

// -------- Helper functions --------
function broadcast(roomId, data) {
  const room = rooms.get(roomId);

  if (!room) {
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function send(ws, type, payload) {
  ws.send(
    JSON.stringify({
      type,
      ...payload,
    }),
  );
}

// -------- Socket events --------
wss.on('connection', (ws) => {
  ws.username = null;
  ws.roomId = 'general';
  rooms.get(ws.roomId).users.add(ws);

  send(ws, 'rooms', {
    rooms: [...rooms.entries()].map(([id, room]) => ({ id, name: room.name })),
  });

  send(ws, 'joined', {
    roomId: 'general',
    messages: rooms.get('general').messages,
  });

  ws.on('message', (rawData) => {
    const data = JSON.parse(rawData.toString());

    switch (data.type) {
      case 'set_username':
        ws.username = data.username;
        break;

      case 'send_message': {
        if (!ws.username) {
          return send(ws, 'error', { message: 'Username not set' });
        }

        const room = rooms.get(ws.roomId);

        if (!room) {
          return send(ws, 'error', { message: 'Room not found' });
        }

        const message = {
          author: ws.username,
          text: data.text,
          timestamp: new Date(),
          roomId: ws.roomId,
        };

        room.messages.push(message);
        broadcast(ws.roomId, { type: 'new_message', message });
        break;
      }

      case 'create_room': {
        const { roomId, name } = data;

        if (rooms.has(roomId)) {
          return send(ws, 'error', { message: 'Room already exists' });
        }

        rooms.set(roomId, { name, messages: [], users: new Set() });

        broadcast('general', {
          type: 'rooms_update',
          rooms: [...rooms.entries()].map(([id, r]) => ({ id, name: r.name })),
        });
        break;
      }

      case 'join_room': {
        const { roomId } = data;

        if (!rooms.has(roomId)) {
          return send(ws, 'error', { message: 'Room not found' });
        }

        rooms.get(ws.roomId)?.users.delete(ws);
        ws.roomId = roomId;
        rooms.get(roomId).users.add(ws);

        send(ws, 'joined', { roomId, messages: rooms.get(roomId).messages });
        break;
      }

      case 'rename_room': {
        const { roomId, newName } = data;
        const room = rooms.get(roomId);

        if (!room) {
          return send(ws, 'error', { message: 'Room not found' });
        }
        room.name = newName;

        broadcast('general', {
          type: 'rooms_update',
          rooms: [...rooms.entries()].map(([id, r]) => ({ id, name: r.name })),
        });
        break;
      }

      case 'delete_room': {
        const { roomId } = data;

        if (!rooms.has(roomId)) {
          return send(ws, 'error', { message: 'Room not found' });
        }

        const room = rooms.get(roomId);

        const defaultRoom = rooms.get('general');

        room.users.forEach((user) => {
          user.roomId = 'general';
          defaultRoom.users.add(user);

          send(user, 'joined', {
            roomId: 'general',
            messages: defaultRoom.messages,
          });
        });

        rooms.delete(roomId);

        broadcast('general', {
          type: 'rooms_update',
          rooms: [...rooms.entries()].map(([id, r]) => ({ id, name: r.name })),
        });
        break;
      }
    }
  });

  ws.on('close', () => {
    const room = rooms.get(ws.roomId);

    if (room) {
      room.users.delete(ws);
    }
  });
});
