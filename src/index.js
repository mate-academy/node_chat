'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// ─── In-memory state ─────────────────────────────────────────────────────────

const rooms = new Map(); // roomId → { id, name, messages[] }
const clients = new Map(); // ws → { username, roomId }

let nextRoomId = 1;

function createRoom(roomName) {
  const id = String(nextRoomId++);

  rooms.set(id, { id, name: roomName, messages: [] });

  return rooms.get(id);
}

// Seed a default room so the app is usable right away
createRoom('general');

// ─── HTTP server (serves static client files) ────────────────────────────────

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const filePath = path.join(
    PUBLIC_DIR,
    req.url === '/' ? 'index.html' : req.url,
  );

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'tsxt/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');

      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// ─── WebSocket helpers ───────────────────────────────────────────────────────

function send(ws, type, payload = {}) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

function broadcast(roomId, type, payload, excludeWs = null) {
  for (const [ws, client] of clients) {
    if (client.roomId === roomId && ws !== excludeWs) {
      send(ws, type, payload);
    }
  }
}

function broadcastRoomList() {
  // eslint-disable-next-line
  const roomList = [...rooms.values()].map(({ id, name }) => ({
    id,
    name,
  }));

  for (const ws of clients.keys()) {
    send(ws, 'room_list', { rooms: roomList });
  }
}

// ─── Message handlers ────────────────────────────────────────────────────────

const handlers = {
  set_username(ws, { username }) {
    if (!username || !username.trim()) {
      send(ws, 'error', { message: 'User name cannot be empty' });

      return;
    }

    clients.get(ws).username = username.trim();
    send(ws, 'username_confirmed', { username: username.trim() });

    send(ws, 'room_list', {
      rooms: [...rooms.values()].map(({ id, name }) => ({ id, name })),
    });
  },

  create_room(ws, { name }) {
    if (!name || !name.trim()) {
      send(ws, 'error', { message: 'Room name cannot be empty' });

      return;
    }

    const room = createRoom(name.trim());

    broadcastRoomList();

    send(ws, 'room_created', { room: { id: room.id, name: room.name } });
  },

  rename_room(ws, { roomId, name }) {
    const room = rooms.get(roomId);

    if (!room) {
      send(ws, 'error', { message: 'Room not found' });

      return;
    }

    if (!name || !name.trim()) {
      send(ws, 'error', { message: 'Room name cannot be empty' });

      return;
    }

    room.name = name.trim();

    broadcastRoomList();

    broadcast(roomId, 'room_renamed', { roomId, name: room.name });
  },

  join_room(ws, { roomId }) {
    const room = rooms.get(roomId);
    const client = clients.get(ws);

    if (!room) {
      send(ws, 'error', { message: 'Room not found.' });

      return;
    }

    if (!client.username) {
      send(ws, 'error', { message: 'Set a username first' });

      return;
    }

    client.roomId = roomId;

    send(ws, 'room_joined', {
      room: { id: room.id, name: room.name },
      messages: room.messages,
    });

    broadcast(roomId, 'user_joined', { username: client.username }, ws);
  },

  delete_room(ws, { roomId }) {
    if (!rooms.has(roomId)) {
      send(ws, 'error', { message: 'Room not found.' });

      return;
    }

    rooms.delete(roomId);

    // Move everyone in that room out
    for (const [clientWs, client] of clients) {
      if (client.roomId === roomId) {
        client.roomId = null;
        send(clientWs, 'room_deleted', { roomId });
      }
    }

    broadcastRoomList();
  },

  send_message(ws, { text }) {
    const client = clients.get(ws);

    if (!client.roomId) {
      send(ws, 'error', { message: 'Join a room first.' });

      return;
    }

    if (!text || !text.trim()) {
      send(ws, 'error', { message: 'Message cannot be empty.' });

      return;
    }

    const room = rooms.get(client.roomId);

    if (!room) {
      send(ws, 'error', { message: 'Room not found.' });

      return;
    }

    const message = {
      id: Date.now(),
      author: client.username,
      text: text.trim(),
      time: new Date().toISOString(),
    };

    room.messages.push(message);
    broadcast(client.roomId, 'new_message', { message });
  },
};

// ─── WebSocket server ────────────────────────────────────────────────────────

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  clients.set(ws, { username: null, roomId: null });

  ws.on('message', (raw) => {
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      send(ws, 'error', { message: 'Invalid JSON.' });

      return;
    }

    const { type, ...payload } = parsed;
    const handler = handlers[type];

    if (handler) {
      handler(ws, payload);
    } else {
      send(ws, 'error', { message: `Unknown message type: ${type}` });
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);

    if (client && client.roomId && client.username) {
      broadcast(client.roomId, 'user_left', { username: client.username });
    }

    clients.delete(ws);
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  // eslint-disable-next-line
  console.log(`Chat server running at http://localhost:${PORT}`);
});
