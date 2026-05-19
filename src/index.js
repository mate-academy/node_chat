'use strict';
/* eslint-disable no-console */

import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const rooms = {
  General: { messages: [] },
};

const activeConnections = new Map();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(dirname, '../public')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcastRoomList() {
  const roomNames = Object.keys(rooms);
  const packet = JSON.stringify({ type: 'ROOM_LIST', rooms: roomNames });

  for (const [wsClinet] of activeConnections) {
    wsClinet.send(packet);
  }
}

function broadcastToRoom(roomName, packetData) {
  const packet = JSON.stringify(packetData);

  for (const [wsClinet, userData] of activeConnections) {
    if (userData.room === roomName) {
      wsClinet.send(packet);
    }
  }
}

wss.on('connection', (ws) => {
  console.log('New user is connected');
  ws.send(JSON.stringify({ type: 'ROOM_LIST', rooms: Object.keys(rooms) }));

  activeConnections.set(ws, { username: null, room: null });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const user = activeConnections.get(ws);

      switch (data.type) {
        case 'SET_USERNAME':
          user.username = data.username;
          console.log(`User set username to: ${data.username}`);
          break;

        case 'JOIN_ROOM':
          const newRoom = data.roomName;

          user.room = newRoom;
          console.log(`${user.username} joined room: ${newRoom}`);

          if (!rooms[newRoom]) {
            rooms[newRoom] = { messages: [] };
          }

          ws.send(
            JSON.stringify({
              type: 'ROOM_HISTORY',
              messages: rooms[newRoom].messages,
            }),
          );
          break;

        case 'NEW_MESSAGE':
          if (!user.username || !user.room) {
            return;
          }

          const msgObject = {
            author: user.username,
            text: data.text,
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };

          rooms[user.room].messages.push(msgObject);

          broadcastToRoom(user.room, {
            type: 'MESSAGE',
            message: msgObject,
          });
          break;

        case 'CREATE_ROOM':
          const roomToCreate = data.roomName;

          if (roomToCreate && !rooms[roomToCreate]) {
            rooms[roomToCreate] = { messages: [] };
            console.log(`Room created: ${roomToCreate}`);
            broadcastRoomList();
          }
          break;

        case 'RENAME_ROOM':
          const { oldName, newName } = data;

          if (rooms[oldName] && newName && !rooms[newName]) {
            rooms[newName] = rooms[oldName];
            delete rooms[oldName];

            for (const userData of activeConnections.values()) {
              if (userData.room === oldName) {
                userData.room = newName;
              }
            }
            console.log(`Room renamed from ${oldName} to ${newName}`);
            broadcastRoomList();
          }
          break;

        case 'DELETE_ROOM':
          const roomToDelete = data.roomName;

          if (rooms[roomToDelete] && roomToDelete !== 'General') {
            delete rooms[roomToDelete];

            for (const [wsClient, userData] of activeConnections) {
              if (userData.room === roomToDelete) {
                userData.room = 'General';

                wsClient.send(
                  JSON.stringify({
                    type: 'ROOM_HISTORY',
                    messages: rooms['General'].messages,
                  }),
                );
              }
            }
            console.log(`Room deleted: ${roomToDelete}`);
            broadcastRoomList();
          }
          break;
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  ws.on('close', () => {
    console.log('User is disconnected');
    activeConnections.delete(ws);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
