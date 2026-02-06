import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';

import {
  rooms,
  createRoom,
  renameRoom,
  deleteRoom,
  joinRoom,
} from './websocket.js';

const app = express();
const server = http.createServer(app);

app.use(express.static('src'));

const wss = new WebSocketServer({ server });

function broadcastRoomList() {
  const list = Object.keys(rooms);
  const message = JSON.stringify({ type: 'rooms', list });

  wss.clients.forEach((client) => {
    client.send(message);
  });
}

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const data = JSON.parse(raw);

    if (data.type === 'create_room') {
      createRoom(data.name);
      broadcastRoomList();
    }

    if (data.type === 'rename_room') {
      renameRoom(data.oldName, data.newName);
      broadcastRoomList();
    }

    if (data.type === 'delete_room') {
      deleteRoom(data.name);
      broadcastRoomList();
    }

    if (data.type === 'join_room') {
      joinRoom(data.name, ws);

      ws.send(
        JSON.stringify({
          type: 'history',
          messages: rooms[data.name]?.messages || [],
        }),
      );
    }

    if (data.type === 'message') {
      const msg = {
        id: Date.now(),
        author: data.author,
        text: data.text,
        time: new Date().toISOString(),
      };

      Object.values(rooms).forEach((room) => {
        if (room.users.has(ws)) {
          room.messages.push(msg);

          room.users.forEach((client) => {
            client.send(
              JSON.stringify({
                type: 'message',
                message: msg,
              }),
            );
          });
        }
      });
    }
  });

  broadcastRoomList();
});

export { server };
