'use strict';

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const server = app.listen(3000, () => {
  // console.log('Server on http://localhost:3000');
});

const wss = new WebSocketServer({ server });

const rooms = new Map();

wss.on('connection', (ws) => {
  // console.log('Client connected');

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    if (message.type === 'setName') {
      ws.username = message.username;
      // console.log('Username set:', ws.username);
    }

    if (message.type === 'message') {
      const room = rooms.get(ws.room);

      if (room) {
        room.messages.push(message);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.room === ws.room) {
            client.send(JSON.stringify(message));
          }
        });
      }
    }

    if (message.type === 'createRoom') {
      const roomName = message.room;

      if (!rooms.has(roomName)) {
        rooms.set(roomName, { name: roomName, messages: [] });
      }

      const roomList = Array.from(rooms.keys());

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'rooms', rooms: roomList }));
        }
      });
    }

    if (message.type === 'joinRoom') {
      ws.room = message.room;

      const room = rooms.get(message.room);

      if (room) {
        ws.send(JSON.stringify({ type: 'history', messages: room.messages }));
      }
    }

    if (message.type === 'renameRoom') {
      const { oldName, newName } = message;

      if (rooms.has(oldName)) {
        const room = rooms.get(oldName);

        room.name = newName;
        rooms.delete(oldName);
        rooms.set(newName, room);

        const roomList = Array.from(rooms.keys());

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'rooms', rooms: roomList }));
          }
        });
      }
    }

    if (message.type === 'deleteRoom') {
      rooms.delete(message.room);

      const roomList = Array.from(rooms.keys());

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'rooms', rooms: roomList }));
        }
      });
    }

    // console.log('Received:', data.toString());
  });
});

app.use(express.static(path.join(dirname, 'public')));
