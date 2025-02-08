const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {}; // { roomName: [{ author, time, text }] }
const users = new Map(); // { ws: { name, room } }

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      users.set(ws, { name: data.name, room: data.room });

      if (!rooms[data.room]) {
        rooms[data.room] = [];
      }

      ws.send(JSON.stringify({ type: 'history', messages: rooms[data.room] }));

      broadcast(data.room, { type: 'info', text: `${data.name} приєднався` });
    }

    if (data.type === 'message') {
      const user = users.get(ws);

      if (!user) {
        return;
      }

      const msg = {
        author: user.name,
        time: new Date().toLocaleTimeString(),
        text: data.text,
      };

      rooms[user.room].push(msg);
      broadcast(user.room, { type: 'message', ...msg });
    }
  });

  ws.on('close', () => {
    const user = users.get(ws);

    if (user) {
      broadcast(user.room, { type: 'info', text: `${user.name} вийшов` });
      users.delete(ws);
    }
  });
});

function broadcast(room, message) {
  wss.clients.forEach((client) => {
    const user = users.get(client);

    if (user && user.room === room && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// eslint-disable-next-line no-console
server.listen(3000, () => console.log('Chat server running on port 3000'));
