/* eslint-disable no-console */
'use strict';

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { RoomManager } from './rooms.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const roomManager = new RoomManager();

app.use(cors());
app.use(express.json());

// REST: Кімнати

app.get('/rooms', (req, res) => {
  res.json(roomManager.getRooms());
});

app.post('/rooms', (req, res) => {
  const { name } = req.body;
  const room = roomManager.createRoom(name);

  res.status(201).json(room);
});

app.put('/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  roomManager.renameRoom(id, name);
  res.sendStatus(204);
});

app.delete('/rooms/:id', (req, res) => {
  const { id } = req.params;

  roomManager.deleteRoom(id);
  res.sendStatus(204);
});

// WebSocket: Повідомлення та підключення

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    let message;

    try {
      message = JSON.parse(data);
    } catch {
      return;
    }

    const { type } = message;

    if (type === 'join') {
      ws.username = message.username;
      ws.roomId = message.roomId;

      const room = roomManager.getRoom(ws.roomId);

      if (!room) {
        return;
      }

      roomManager.addClient(ws.roomId, ws);

      ws.send(
        JSON.stringify({
          type: 'history',
          messages: room.messages,
        }),
      );
    }

    if (type === 'message') {
      const msg = {
        author: ws.username,
        time: new Date().toISOString(),
        text: message.text,
      };

      roomManager.addMessage(ws.roomId, msg);

      roomManager.broadcast(ws.roomId, {
        type: 'message',
        message: msg,
      });
    }
  });

  ws.on('close', () => {
    if (ws.roomId) {
      roomManager.removeClient(ws.roomId, ws);
    }
  });
});

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
