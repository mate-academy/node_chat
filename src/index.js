'use strict';

const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const { WebSocket, WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const users = new Set();
const rooms = new Map();
let nextRoomId = 1;
let nextMessageId = 1;

function createRoom(name) {
  const id = String(nextRoomId);

  nextRoomId += 1;

  const room = {
    id,
    name: name.trim(),
    messages: [],
  };

  rooms.set(id, room);

  return room;
}

createRoom('General');

function broadcast(payload) {
  const serializedPayload = JSON.stringify(payload);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serializedPayload);
    }
  });
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      if (!data) {
        resolve({});

        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function sanitizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getRoomList() {
  return [...rooms.values()].map((room) => ({
    id: room.id,
    name: room.name,
    messagesCount: room.messages.length,
  }));
}

function getRoomById(roomId) {
  return rooms.get(roomId);
}

function isFallbackRoom(room) {
  return room.name.toLowerCase() === 'general';
}

function matchRoomPath(urlPath) {
  const roomMatch = urlPath.match(/^\/api\/rooms\/([^/]+)$/);
  const roomMessagesMatch = urlPath.match(/^\/api\/rooms\/([^/]+)\/messages$/);

  return {
    roomId: roomMatch ? roomMatch[1] : null,
    roomMessagesId: roomMessagesMatch ? roomMessagesMatch[1] : null,
  };
}

async function serveStaticFile(res, urlPath) {
  const requestedPath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { message: 'Forbidden' });

    return;
  }

  try {
    const fileContents = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
    };
    const contentType = contentTypes[ext] || 'text/plain; charset=utf-8';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileContents.length,
    });
    res.end(fileContents);
  } catch (error) {
    sendJson(res, 404, { message: 'Not found' });
  }
}

async function handleApi(req, res, urlPath) {
  if (req.method === 'POST' && urlPath === '/api/users') {
    try {
      const { username } = await readJsonBody(req);
      const normalizedUsername = sanitizeText(username);

      if (!normalizedUsername) {
        sendJson(res, 400, { message: 'Username is required' });

        return;
      }

      users.add(normalizedUsername);
      sendJson(res, 200, { username: normalizedUsername });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }

    return;
  }

  if (req.method === 'GET' && urlPath === '/api/rooms') {
    sendJson(res, 200, { rooms: getRoomList() });

    return;
  }

  if (req.method === 'POST' && urlPath === '/api/rooms') {
    try {
      const { name } = await readJsonBody(req);
      const roomName = sanitizeText(name);

      if (!roomName) {
        sendJson(res, 400, { message: 'Room name is required' });

        return;
      }

      const room = createRoom(roomName);

      sendJson(res, 201, {
        room: { id: room.id, name: room.name, messagesCount: 0 },
      });

      broadcast({
        type: 'rooms_updated',
        rooms: getRoomList(),
      });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }

    return;
  }

  const { roomId, roomMessagesId } = matchRoomPath(urlPath);

  if (req.method === 'PATCH' && roomId) {
    try {
      const room = getRoomById(roomId);

      if (!room) {
        sendJson(res, 404, { message: 'Room not found' });

        return;
      }

      const { name } = await readJsonBody(req);
      const nextName = sanitizeText(name);

      if (!nextName) {
        sendJson(res, 400, { message: 'Room name is required' });

        return;
      }

      room.name = nextName;

      sendJson(res, 200, {
        room: {
          id: room.id,
          name: room.name,
          messagesCount: room.messages.length,
        },
      });

      broadcast({
        type: 'rooms_updated',
        rooms: getRoomList(),
      });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }

    return;
  }

  if (req.method === 'DELETE' && roomId) {
    const room = getRoomById(roomId);

    if (!room) {
      sendJson(res, 404, { message: 'Room not found' });

      return;
    }

    if (rooms.size === 1) {
      sendJson(res, 400, { message: 'At least one room is required' });

      return;
    }

    if (isFallbackRoom(room)) {
      sendJson(res, 400, { message: 'General room cannot be deleted' });

      return;
    }

    rooms.delete(roomId);
    sendJson(res, 204, {});

    broadcast({
      type: 'rooms_updated',
      rooms: getRoomList(),
      deletedRoomId: roomId,
    });

    return;
  }

  if (req.method === 'GET' && roomMessagesId) {
    const room = getRoomById(roomMessagesId);

    if (!room) {
      sendJson(res, 404, { message: 'Room not found' });

      return;
    }

    sendJson(res, 200, {
      messages: room.messages,
    });

    return;
  }

  if (req.method === 'POST' && roomMessagesId) {
    try {
      const room = getRoomById(roomMessagesId);

      if (!room) {
        sendJson(res, 404, { message: 'Room not found' });

        return;
      }

      const { author, text } = await readJsonBody(req);
      const normalizedAuthor = sanitizeText(author);
      const normalizedText = sanitizeText(text);

      if (!normalizedAuthor || !normalizedText) {
        sendJson(res, 400, {
          message: 'Message author and text are required',
        });

        return;
      }

      const message = {
        id: String(nextMessageId),
        author: normalizedAuthor,
        text: normalizedText,
        time: new Date().toISOString(),
      };

      nextMessageId += 1;
      room.messages.push(message);
      sendJson(res, 201, { message });

      broadcast({
        type: 'message_created',
        roomId: room.id,
        message,
        rooms: getRoomList(),
      });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }

    return;
  }

  sendJson(res, 404, { message: 'API route not found' });
}

const server = http.createServer(async (req, res) => {
  const hostHeader = req.headers.host || `localhost:${PORT}`;
  const requestUrl = new URL(req.url || '/', `http://${hostHeader}`);
  const urlPath = requestUrl.pathname;

  if (urlPath.startsWith('/api/')) {
    await handleApi(req, res, urlPath);

    return;
  }

  await serveStaticFile(res, urlPath);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  socket.send(
    JSON.stringify({
      type: 'rooms_updated',
      rooms: getRoomList(),
    }),
  );
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
