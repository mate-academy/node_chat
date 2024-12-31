'use strict';
import http from 'http';
import { WebSocketServer } from 'ws';

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const messages = [];

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/message', (req, res) => {
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).send({ error: 'Author and text are required' });
  }

  const message = {
    author,
    text,
    time: new Date(),
  };

  messages.push(message);

  res.status(201).send(message);
});

app.get('/messages', (req, res) => {
  res.status(200).send(messages);
});

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });
console.log("Starting WebSocket server...");

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

let clients = [];
const rooms = {};

wsServer.on('connection', (ws) => {
  let currentRoom = null;

  clients.push(ws);
  console.log(`====TEST===`)

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'join') {
        const roomName = data.room;

        currentRoom = roomName;

        if (!rooms[roomName]) {
          rooms[roomName] = [];
        }

        ws.send(JSON.stringify({ type: 'history', messages: rooms[roomName] }));
      } else if (data.type === 'create') {
        const roomName = data.room;

        if (!rooms[roomName]) {
          rooms[roomName] = [];
          ws.send(JSON.stringify({ type: 'roomCreated', room: roomName }));
        } else {
          ws.send(
            JSON.stringify({ type: 'error', message: 'Room already exists' }),
          );
        }
      } else if (data.type === 'message' && currentRoom) {
        const newMessage = {
          author: data.author,
          text: data.text,
          time: new Date().toLocaleTimeString(),
        };

        rooms[currentRoom].push(newMessage);

        clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ type: 'message', message: newMessage }),
            );
          }
        });
      } else if (data.type === 'rename' && rooms[data.oldName]) {
        const newRoomName = data.newName;

        if (!rooms[newRoomName]) {
          rooms[newRoomName] = rooms[data.oldName];
          delete rooms[data.oldName];

          ws.send(
            JSON.stringify({
              type: 'roomRenamed',
              oldName: data.oldName,
              newName: newRoomName,
            }),
          );
        } else {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Room with new name already exists',
            }),
          );
        }
      } else if (data.type === 'delete' && rooms[data.room]) {
        delete rooms[data.room];
        ws.send(JSON.stringify({ type: 'roomDeleted', room: data.room }));
      }
    } catch (error) {
      console.error('Invalid message:', message);

      ws.send(
        JSON.stringify({ type: 'error', message: 'Invalid message format' }),
      );
    }
  });

  ws.on('close', () => {
    clients = clients.filter((client) => client !== ws);
  });

  ws.send(JSON.stringify({ author: 'Server', text: 'Welcome to the chat!' }));
});
