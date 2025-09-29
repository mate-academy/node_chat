/* eslint-disable no-console */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

const MIME = {
  html: 'text/html; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json; charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
};

function sendHttpFile(filePath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');

      return;
    }

    const ext = path.extname(filePath).slice(1).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  // serve files from public/
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath === '/' || urlPath === '') {
    urlPath = '/index.html';
  }

  const filePath = path.join(__dirname, '..', 'public', urlPath);
  // prevent path escaping

  if (!filePath.startsWith(path.join(__dirname, '..', 'public'))) {
    res.writeHead(403);
    res.end('Forbidden');

    return;
  }
  sendHttpFile(filePath, res);
});

// In-memory data
const rooms = new Map();

function makeId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
}

function createRoom(name) {
  const id = makeId('room');

  rooms.set(id, { id, name, messages: [] });

  return rooms.get(id);
}

// create a default room
createRoom('General');

const wss = new WebSocket.Server({ noServer: true });

function safeSend(ws, type, payload) {
  try {
    ws.send(JSON.stringify({ type, payload }));
  } catch (e) {
    // ignore send errors
  }
}

function broadcast(type, payload) {
  const data = JSON.stringify({ type, payload });

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

function broadcastRoomsList() {
  const list = Array.from(rooms.values()).map((r) => ({
    id: r.id,
    name: r.name,
  }));

  broadcast('rooms_list', { rooms: list });
}

function sendError(ws, code, message) {
  safeSend(ws, 'error', { code, message });
}

function handleClientMessage(ws, raw) {
  let msg;

  try {
    msg = JSON.parse(raw);
  } catch (e) {
    sendError(ws, 'invalid_json', 'Failed to parse JSON');

    return;
  }

  if (!msg || typeof msg.type !== 'string') {
    sendError(ws, 'invalid_message', 'Message must have a string `type`');

    return;
  }

  const p = msg.payload || {};

  switch (msg.type) {
    case 'set_username': {
      const username = typeof p.username === 'string' ? p.username.trim() : '';

      if (!username) {
        return sendError(ws, 'invalid_username', 'Username must be non-empty');
      }
      ws.username = username;
      safeSend(ws, 'username_set', { username });
      break;
    }

    case 'create_room': {
      const name = typeof p.name === 'string' ? p.name.trim() : '';

      if (!name) {
        return sendError(
          ws,
          'invalid_room_name',
          'Room name must be non-empty',
        );
      }
      // prevent duplicate names

      for (const r of rooms.values()) {
        if (r.name === name) {
          return sendError(
            ws,
            'room_exists',
            'Room with this name already exists',
          );
        }
      }
      createRoom(name);
      broadcastRoomsList();
      break;
    }

    case 'rename_room': {
      const roomId = String(p.roomId || '');
      const name = typeof p.name === 'string' ? p.name.trim() : '';

      if (!rooms.has(roomId)) {
        return sendError(ws, 'room_not_found', 'Room not found');
      }

      if (!name) {
        return sendError(
          ws,
          'invalid_room_name',
          'Room name must be non-empty',
        );
      }

      const room = rooms.get(roomId);

      room.name = name;
      broadcastRoomsList();
      break;
    }

    case 'delete_room': {
      const roomId = String(p.roomId || '');

      if (!rooms.has(roomId)) {
        return sendError(ws, 'room_not_found', 'Room not found');
      }

      if (rooms.size <= 1) {
        return sendError(
          ws,
          'cannot_delete_last',
          'Cannot delete the last room',
        );
      }
      rooms.delete(roomId);
      broadcastRoomsList();
      // Move clients from deleted room to first existing room

      const fallbackRoomId = Array.from(rooms.keys())[0];

      for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) {
          continue;
        }

        if (client.roomId === roomId) {
          client.roomId = fallbackRoomId;

          const r = rooms.get(fallbackRoomId);

          safeSend(client, 'joined_room', {
            roomId: r.id,
            roomName: r.name,
            messages: r.messages.slice(),
          });
        }
      }
      break;
    }

    case 'join_room': {
      const roomId = String(p.roomId || '');

      if (!rooms.has(roomId)) {
        return sendError(ws, 'room_not_found', 'Room not found');
      }

      const room = rooms.get(roomId);

      ws.roomId = roomId;

      safeSend(ws, 'joined_room', {
        roomId: room.id,
        roomName: room.name,
        messages: room.messages.slice(),
      });
      break;
    }

    case 'send_message': {
      const roomId = String(p.roomId || '');
      const text = typeof p.text === 'string' ? p.text.trim() : '';

      if (!rooms.has(roomId)) {
        return sendError(ws, 'room_not_found', 'Room not found');
      }

      if (!text) {
        return sendError(ws, 'invalid_text', 'Message must be non-empty');
      }

      if (!ws.username) {
        return sendError(
          ws,
          'no_username',
          'Set a username before sending messages',
        );
      }

      const message = {
        id: makeId('msg'),
        author: ws.username,
        text,
        ts: new Date().toISOString(),
      };
      const room = rooms.get(roomId);

      room.messages.push(message);
      // keep last 500 messages

      if (room.messages.length > 500) {
        room.messages = room.messages.slice(-500);
      }
      broadcast('message', { roomId, message });
      break;
    }
    default:
      sendError(ws, 'unknown_type', `Unknown type: ${msg.type}`);
  }
}

wss.on('connection', (ws) => {
  // attach metadata to ws
  ws.username = null;
  ws.roomId = null;
  // send rooms list on connect

  const list = Array.from(rooms.values()).map((r) => ({
    id: r.id,
    name: r.name,
  }));

  safeSend(ws, 'rooms_list', { rooms: list });

  ws.on('message', (raw) => {
    try {
      handleClientMessage(ws, raw);
    } catch (e) {
      sendError(ws, 'server_error', 'Internal server error');
    }
  });
});

server.on('upgrade', (request, socket, head) => {
  // handle websocket upgrade
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Expose for tests (if needed)
module.exports = { server, wss, rooms };
