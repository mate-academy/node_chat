'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ----- In-memory storage -----
// rooms: Map<roomId, { id, name, messages: [{ author, text, time }] }>
const rooms = new Map();

function createRoom(name) {
  const id = `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  rooms.set(id, { id, name, messages: [] });

  return rooms.get(id);
}

// Default room so the chat is never empty
createRoom('General');

function getRoomsList() {
  return [...rooms.values()].map(({ id, name }) => ({ id, name }));
}

function broadcastToRoom(roomId, data) {
  const payload = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
      client.send(payload);
    }
  });
}

function broadcastRoomsList() {
  const payload = JSON.stringify({
    type: 'roomsList',
    rooms: getRoomsList(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on('connection', (ws) => {
  ws.username = null;
  ws.roomId = null;

  ws.send(
    JSON.stringify({
      type: 'roomsList',
      rooms: getRoomsList(),
    }),
  );

  ws.on('message', (raw) => {
    let data;

    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }

    switch (data.type) {
      case 'join': {
        ws.username = data.username;

        const roomId = rooms.has(data.roomId)
          ? data.roomId
          : [...rooms.keys()][0];

        const room = rooms.get(roomId);

        if (!room) {
          return;
        }

        ws.roomId = roomId;

        ws.send(
          JSON.stringify({
            type: 'history',
            roomId,
            messages: room.messages,
          }),
        );

        broadcastToRoom(roomId, {
          type: 'system',
          text: `${ws.username} joined the room`,
          time: Date.now(),
        });
        break;
      }

      case 'switchRoom': {
        const room = rooms.get(data.roomId);

        if (!room) {
          return;
        }

        ws.roomId = data.roomId;

        ws.send(
          JSON.stringify({
            type: 'history',
            roomId: data.roomId,
            messages: room.messages,
          }),
        );
        break;
      }

      case 'message': {
        const room = rooms.get(ws.roomId);

        if (!room || !ws.username || !data.text || !data.text.trim()) {
          return;
        }

        const message = {
          author: ws.username,
          text: data.text.trim(),
          time: Date.now(),
        };

        room.messages.push(message);

        broadcastToRoom(ws.roomId, {
          type: 'message',
          roomId: ws.roomId,
          message,
        });
        break;
      }

      case 'createRoom': {
        if (!data.name || !data.name.trim()) {
          return;
        }

        createRoom(data.name.trim());
        broadcastRoomsList();
        break;
      }

      case 'renameRoom': {
        const room = rooms.get(data.roomId);

        if (!room || !data.name || !data.name.trim()) {
          return;
        }

        room.name = data.name.trim();
        broadcastRoomsList();
        break;
      }

      case 'deleteRoom': {
        // keep at least one room alive
        if (rooms.size <= 1 || !rooms.has(data.roomId)) {
          return;
        }

        rooms.delete(data.roomId);
        broadcastRoomsList();
        break;
      }

      default:
        break;
    }
  });

  ws.on('close', () => {
    if (ws.roomId && ws.username) {
      broadcastToRoom(ws.roomId, {
        type: 'system',
        text: `${ws.username} left the room`,
        time: Date.now(),
      });
    }
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on port ${PORT}`);
});
