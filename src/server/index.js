/* eslint-disable no-console */
'use strict';
import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  createRoom,
  renameRoom,
  deleteRoom,
  addMessage,
  getMessages,
} from './rooms.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const server = app.listen(PORT);
// , () =>
//   console.log(`Server running on http://localhost:${PORT}`),);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log(`🟢 New connection`);

  ws.on('message', (data) => {
    const { type, username, room, text, newRoom } = JSON.parse(data);

    if (type === 'join') {
      ws.room = room;
      createRoom(room);
      ws.send(JSON.stringify({ type: 'history', messages: getMessages(room) }));
    }

    if (type === 'message' && ws.room) {
      const message = {
        author: username,
        time: new Date().toLocaleTimeString(),
        text,
      };

      addMessage(ws.room, message);

      wss.clients.forEach((client) => {
        if (client.readyState === 1 && client.room === ws.room) {
          client.send(JSON.stringify({ type: 'message', message }));
        }
      });
    }

    if (type === 'create') {
      createRoom(room);
    }

    if (type === 'rename') {
      renameRoom(room, newRoom);
    }

    if (type === 'delete') {
      deleteRoom(room);

      wss.clients.forEach((client) => {
        if (client.room === room) {
          client.send(JSON.stringify({ type: 'deleted' }));
        }
      });
    }
  });

  ws.on('close', () => console.log(`🔴 User disconnected`));
});
