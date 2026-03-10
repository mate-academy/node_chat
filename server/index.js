/* eslint-disable no-shadow */
'use strict';

const express = require('express');
const http = require('http');
const WS = require('ws');
const WebSocket = WS.WebSocket;
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();
const clients = new Map();

rooms.set('general', {
  id: 'general',
  name: '# general',
  messages: [],
  createdAt: Date.now(),
});

function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcastToRoom(roomId, data, excludeWs = null) {
  wss.clients.forEach((client) => {
    if (client === excludeWs) {
      return;
    }

    const info = clients.get(client);

    if (info && info.roomId === roomId) {
      send(client, data);
    }
  });
}

function getRoomList() {
  return Array.from(rooms.values()).map((r) => ({
    id: r.id,
    name: r.name,
    messageCount: r.messages.length,
    createdAt: r.createdAt,
  }));
}

wss.on('connection', (ws) => {
  send(ws, { type: 'room_list', rooms: getRoomList() });

  ws.on('message', (raw) => {
    let data;

    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    const client = clients.get(ws) || {};

    switch (data.type) {
      case 'set_username': {
        clients.set(ws, { ...client, username: data.username });
        send(ws, { type: 'username_set', username: data.username });
        break;
      }

      case 'join_room': {
        const room = rooms.get(data.roomId);

        if (!room) {
          send(ws, { type: 'error', message: 'Room not found' });
          break;
        }

        clients.set(ws, { ...client, roomId: data.roomId });

        send(ws, {
          type: 'room_history',
          roomId: data.roomId,
          messages: room.messages,
        });

        broadcastToRoom(
          data.roomId,
          {
            type: 'user_joined',
            username: client.username || 'Anonymous',
            roomId: data.roomId,
          },
          ws,
        );

        break;
      }

      case 'send_message': {
        const room = rooms.get(client.roomId);

        if (!room) {
          break;
        }

        const message = {
          id: uuidv4(),
          text: data.text,
          author: client.username || 'Anonymous',
          roomId: client.roomId,
          time: Date.now(),
        };

        room.messages.push(message);

        broadcastToRoom(client.roomId, {
          type: 'new_message',
          message,
        });

        break;
      }

      case 'create_room': {
        const id = uuidv4();
        const newRoom = {
          id,
          name: data.name,
          messages: [],
          createdAt: Date.now(),
        };

        rooms.set(id, newRoom);

        wss.clients.forEach((c) => {
          send(c, {
            type: 'room_created',
            room: { ...newRoom, messageCount: 0 },
          });
        });

        break;
      }

      case 'rename_room': {
        const room = rooms.get(data.roomId);

        if (!room) {
          break;
        }

        room.name = data.name;

        wss.clients.forEach((c) => {
          send(c, {
            type: 'room_renamed',
            roomId: data.roomId,
            name: data.name,
          });
        });

        break;
      }

      case 'delete_room': {
        if (data.roomId === 'general') {
          send(ws, { type: 'error', message: 'Cannot delete general room' });
          break;
        }

        rooms.delete(data.roomId);

        wss.clients.forEach((c) => {
          const info = clients.get(c);

          if (info && info.roomId === data.roomId) {
            clients.set(c, { ...info, roomId: 'general' });
          }
          send(c, { type: 'room_deleted', roomId: data.roomId });
        });

        break;
      }
    }
  });

  ws.on('close', () => {
    const info = clients.get(ws);

    if (info && info.roomId) {
      broadcastToRoom(info.roomId, {
        type: 'user_left',
        username: info.username || 'Anonymous',
      });
    }
    clients.delete(ws);
  });
});

// ========== СТАРТ ==========
const PORT = 5000;

server.listen(PORT);
