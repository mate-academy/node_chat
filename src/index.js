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

  app.wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.room === oldName) {
      client.room = newName;
      client.send(JSON.stringify({ type: 'room-renamed', oldName, newName }));
    }
  });

  res.json({ success: true, room: newName });
});

app.delete('/rooms/:name', (req, res) => {
  const { name } = req.params;

  if (name === 'general') {
    return res.status(400).json({ error: 'Cannot delete default room' });
  }

  if (!rooms[name]) {
    return res.status(404).json({ error: 'Room not found' });
  }

  delete rooms[name];

  app.wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.room === name) {
      client.room = 'general';

      client.send(
        JSON.stringify({
          type: 'room-deleted',
          room: name,
          fallback: 'general',
          messages: rooms.general.messages,
        }),
      );
    }
  });

  res.json({ success: true, deleted: name });
});

app.get('/rooms/:name/messages', (req, res) => {
  const room = rooms[req.params.name];

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room.messages);
});

function isValidMessage(author, text) {
  return (
    typeof author === 'string' &&
    typeof text === 'string' &&
    text.trim().length > 0
  );
}

app.post('/rooms/:name/messages', (req, res) => {
  const room = rooms[req.params.name];

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const { author, text } = req.body;

  if (!isValidMessage(author, text)) {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  const message = { author, text, time: new Date().toISOString() };

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
    // eslint-disable-next-line no-console
    console.log(`Server running at http://localhost:${PORT}/`);
  });

  const wss = new WebSocketServer({ server });

  app.wss = wss;

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      let data;

      try {
        data = JSON.parse(message);
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));

        return;
      }

      if (data.type === 'join') {
        const roomName = data.room || 'general';

        if (!rooms[roomName]) {
          ws.room = 'general';

          ws.send(
            JSON.stringify({
              type: 'info',
              message: `Room "${roomName}" not found. Joined general.`,
              messages: rooms.general.messages,
            }),
          );
        } else {
          ws.room = roomName;

          ws.send(
            JSON.stringify({
              type: 'init',
              messages: rooms[roomName].messages,
            }),
          );
        }
      }

      if (data.type === 'message') {
        if (!isValidMessage(data.author, data.text)) {
          ws.send(JSON.stringify({ type: 'error', error: 'Invalid message' }));

          return;
        }

        const msg = {
          author: data.author,
          text: data.text,
          time: new Date().toISOString(),
        };

        rooms[ws.room].messages.push(msg);

        wss.clients.forEach((client) => {
          if (client.readyState === 1 && client.room === ws.room) {
            client.send(JSON.stringify({ type: 'message', message: msg }));
          }
        });
      }
    });
  });
}

module.exports = app;
