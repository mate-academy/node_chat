/* eslint-disable no-console */
'use strict';

import cors from 'cors';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT || 3000;
const app = express();
const users = [];
let messages = [];
const rooms = [];

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.post('/users', (req, res) => {
  const { username } = req.body;

  users.push(username);

  res.send(username);
});

app.get('/users', (req, res) => {
  res.send(users);
});

app.post('/rooms', (req, res) => {
  const { room } = req.body;

  rooms.push(room);

  res.send(room);
});

app.get('/rooms', (req, res) => {
  res.send(rooms);
});

app.patch('/rooms', (req, res) => {
  const { oldRoom, newName } = req.body;

  const index = rooms.findIndex((r) => r === oldRoom);

  if (index === -1) {
    return res.sendStatus(404);
  }
  rooms[index] = newName;

  messages.forEach((message) => {
    if (message.room === oldRoom) {
      message.room = newName;
    }
  });

  res.send(newName);
});

app.delete('/rooms', (req, res) => {
  const { room } = req.body;
  const index = rooms.findIndex((r) => r === room);

  if (index === -1) {
    return res.sendStatus(404);
  }

  rooms.splice(index, 1);

  messages = messages.filter((message) => message.room !== room);

  res.send(rooms);
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'join-room') {
      socket.room = data.room;

      const roomMessages = messages.filter(
        (message) => message.room === data.room,
      );

      socket.send(
        JSON.stringify({
          type: 'room-history',
          messages: roomMessages,
        }),
      );
    } else if (data.type === 'leave-room') {
      socket.room = null;
    } else {
      if (data.author && data.time && data.text) {
        messages.push(data);

        wss.clients.forEach((client) => {
          if (
            client.room === data.room &&
            client.readyState === WebSocket.OPEN
          ) {
            client.send(JSON.stringify(data));
          }
        });
      }
    }
  });
});
