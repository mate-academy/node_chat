'use strict';
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());

// In-memory storage
const rooms = new Map(); // roomId -> { id, name, messages: [] }
const clients = new Map(); // ws -> { username, roomId }

// Create default room
rooms.set('general', { id: 'general', name: 'General', messages: [] });

// ── REST endpoints ──────────────────────────────────────────────

app.get('/', (req, res) => {
  res.send('Chat server is running');
});

// Get all rooms
app.get('/rooms', (req, res) => {
  res.json([...rooms.values()].map(({ id, name }) => ({ id, name })));
});

// Create a new room
app.post('/rooms', (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  const id = name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  const room = { id, name: name.trim(), messages: [] };

  rooms.set(id, room);

  // Notify all clients about the new room
  broadcast(null, { type: 'room:created', room: { id, name: room.name } });

  res.status(201).json({ id, name: room.name });
});

// Rename a room
app.patch('/rooms/:id', (req, res) => {
  const room = rooms.get(req.params.id);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  room.name = name.trim();

  broadcast(null, { type: 'room:renamed', roomId: room.id, name: room.name });

  res.json({ id: room.id, name: room.name });
});

// Delete a room
app.delete('/rooms/:id', (req, res) => {
  const { id } = req.params;

  if (id === 'general') {
    return res.status(403).json({ error: 'Cannot delete the general room' });
  }

  if (!rooms.has(id)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  rooms.delete(id);

  broadcast(null, { type: 'room:deleted', roomId: id });

  res.status(204).end();
});

// ── WebSocket server ────────────────────────────────────────────

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}/`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  // Default state for this connection
  clients.set(ws, { username: null, roomId: null });

  ws.on('message', (raw) => {
    let msg;

    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    handleMessage(ws, msg);
  });

  ws.on('close', () => {
    const client = clients.get(ws);

    if (client?.username && client?.roomId) {
      broadcastToRoom(client.roomId, ws, {
        type: 'user:left',
        username: client.username,
      });
    }

    clients.delete(ws);
  });
});

// ── Message handler ─────────────────────────────────────────────

function handleMessage(ws, msg) {
  const client = clients.get(ws);

  switch (msg.type) {
    // Client sets their username and joins a room
    case 'user:join': {
      const { username, roomId = 'general' } = msg;

      if (!username?.trim()) {
        return send(ws, { type: 'error', message: 'Username is required' });
      }

      const room = rooms.get(roomId);

      if (!room) {
        return send(ws, { type: 'error', message: 'Room not found' });
      }

      client.username = username.trim();
      client.roomId = roomId;

      // Send existing messages so the new user sees history
      send(ws, {
        type: 'room:history',
        roomId,
        messages: room.messages,
      });

      // Notify others
      broadcastToRoom(roomId, ws, {
        type: 'user:joined',
        username: client.username,
      });

      break;
    }

    // Client switches to a different room
    case 'room:join': {
      if (!client.username) {
        return send(ws, { type: 'error', message: 'Set username first' });
      }

      const { roomId } = msg;
      const room = rooms.get(roomId);

      if (!room) {
        return send(ws, { type: 'error', message: 'Room not found' });
      }

      // Leave previous room
      if (client.roomId) {
        broadcastToRoom(client.roomId, ws, {
          type: 'user:left',
          username: client.username,
        });
      }

      client.roomId = roomId;

      // Send history of the new room
      send(ws, {
        type: 'room:history',
        roomId,
        messages: room.messages,
      });

      broadcastToRoom(roomId, ws, {
        type: 'user:joined',
        username: client.username,
      });

      break;
    }

    // Client sends a chat message
    case 'message:send': {
      if (!client.username) {
        return send(ws, { type: 'error', message: 'Set username first' });
      }

      if (!client.roomId) {
        return send(ws, { type: 'error', message: 'Join a room first' });
      }

      const room = rooms.get(client.roomId);

      if (!room) {
        return;
      }

      const message = {
        id: Date.now(),
        author: client.username,
        text: msg.text?.trim(),
        time: new Date().toISOString(),
      };

      if (!message.text) {
        return;
      }

      room.messages.push(message);

      // Send to everyone in the room including the sender
      broadcastToRoom(client.roomId, null, {
        type: 'message:new',
        roomId: client.roomId,
        message,
      });

      break;
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────

function send(ws, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// Send to all clients in a room; skip `exclude` if provided
function broadcastToRoom(roomId, exclude, data) {
  for (const [ws, client] of clients) {
    if (client.roomId === roomId && ws !== exclude) {
      send(ws, data);
    }
  }
}

// Send to all connected clients; skip `exclude` if provided
function broadcast(exclude, data) {
  for (const [ws] of clients) {
    if (ws !== exclude) {
      send(ws, data);
    }
  }
}
