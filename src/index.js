'use strict';

const { WebSocketServer } = require('ws');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

const rooms = {
  general: { name: 'general', messages: [] },
};

app.get('/', (req, res) => {
  res.send('Server is up');
});

app.get('/rooms', (req, res) => {
  res.json(Object.keys(rooms));
});

app.post('/rooms', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Room name required' });
  }

  if (rooms[name]) {
    return res.status(400).json({ error: 'Room already exists' });
  }

  rooms[name] = { name, messages: [] };
  res.status(201).json({ success: true, room: name });
});

app.get('/rooms/:name/messages', (req, res) => {
  const room = rooms[req.params.name];

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room.messages);
});

app.post('/rooms/:name/messages', (req, res) => {
  const room = rooms[req.params.name];

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const message = {
    author: req.body.author,
    text: req.body.text,
    time: new Date(),
  };

  room.messages.push(message);
  res.status(201).json(message);
});

app.put('/rooms/:oldName', (req, res) => {
  const { oldName } = req.params;
  const { newName } = req.body;

  if (!rooms[oldName]) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (rooms[newName]) {
    return res.status(400).json({ error: 'Room with new name already exists' });
  }

  rooms[newName] = { name: newName, messages: rooms[oldName].messages };
  delete rooms[oldName];

  res.json({ success: true, oldName, newName });
});

app.delete('/rooms/:name', (req, res) => {
  const { name } = req.params;

  if (!rooms[name]) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (name === 'general') {
    return res.status(400).json({ error: 'Cannot delete default room' });
  }

  delete rooms[name];
  res.json({ success: true, deleted: name });
});

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is runnig at http://localhost:${PORT}/`);
});

const wss = new WebSocketServer({ server });

// Broadcast Helper
function broadcast(roomName, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.room === roomName) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  // eslint-disable-next-line no-console
  console.log('New client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      ws.room = data.room || 'general';

      ws.send(
        JSON.stringify({
          type: 'init',
          messages: rooms[ws.room].messages,
        }),
      );
    }

    if (data.type === 'message') {
      const msg = {
        author: data.author,
        text: data.text,
        time: new Date(),
      };

      rooms[ws.room].messages.push(msg);

      broadcast(ws.room, { type: 'message', message: msg });
    }
  });

  ws.on('close', () => {
    // eslint-disable-next-line no-console
    console.log('Client disconnected');
  });
});
