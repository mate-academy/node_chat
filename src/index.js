/* eslint-disable no-console */
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

app.get('/', (req, res) => res.send('Server is up'));

app.get('/rooms', (req, res) => res.json(Object.keys(rooms)));

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

app.put('/rooms/:name', (req, res) => {
  const oldName = req.params.name;
  const { newName } = req.body;

  if (!rooms[oldName]) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (!newName || rooms[newName]) {
    return res.status(400).json({ error: 'Invalid new name' });
  }

  rooms[newName] = { ...rooms[oldName], name: newName };
  delete rooms[oldName];

  res.json({ success: true, room: newName });
});

app.delete('/rooms/:name', (req, res) => {
  const roomName = req.params.name;

  if (roomName === 'general') {
    return res.status(400).json({ error: 'Cannot delete default room' });
  }

  if (!rooms[roomName]) {
    return res.status(404).json({ error: 'Room not found' });
  }

  delete rooms[roomName];
  res.json({ success: true });
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

  if (app.wss) {
    app.wss.clients.forEach((client) => {
      if (client.readyState === 1 && client.room === req.params.name) {
        client.send(JSON.stringify({ type: 'message', message }));
      }
    });
  }

  res.status(201).json(message);
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });

  const wss = new WebSocketServer({ server });

  app.wss = wss;

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      const data = JSON.parse(message);

      if (data.type === 'join') {
        ws.room = data.room || 'general';

        ws.send(
          JSON.stringify({ type: 'init', messages: rooms[ws.room].messages }),
        );
      }

      if (data.type === 'message') {
        const msg = { author: data.author, text: data.text, time: new Date() };

        rooms[ws.room].messages.push(msg);

        wss.clients.forEach((client) => {
          if (client.readyState === 1 && client.room === ws.room) {
            client.send(JSON.stringify({ type: 'message', message: msg }));
          }
        });
      }
    });

    ws.on('close', () => console.log('Client disconnected'));
  });
}

module.exports = app;
