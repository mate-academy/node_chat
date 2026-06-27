'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const rooms = [];

function sendJson(res, data, status = 200) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendError(res, message, status = 400) {
  sendJson(res, { error: message }, status);
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1e6) {
      req.connection.destroy();
    }
  });
  req.on('end', () => {
    if (!body) {
      return callback(null, {});
    }

    try {
      const parsed = JSON.parse(body);
      callback(null, parsed);
    } catch (error) {
      callback(error);
    }
  });
}

function getRoomById(id) {
  return rooms.find((room) => room.id === id);
}

function sendStaticFile(req, res, pathname) {
  let fileName = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = path.join(PUBLIC_DIR, fileName);

  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(fileBuffer);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api')) {
    const apiPath = pathname.slice(4);
    if (apiPath === '/rooms' && req.method === 'GET') {
      const roomsList = rooms.map(({ id, title }) => ({ id, title }));
      return sendJson(res, roomsList);
    }

    if (apiPath === '/rooms' && req.method === 'POST') {
      return parseBody(req, (err, body) => {
        if (err) {
          return sendError(res, 'Invalid JSON', 400);
        }

        const title = (body.title || '').trim();
        if (!title) {
          return sendError(res, 'Room title is required', 400);
        }

        const room = {
          id: randomUUID(),
          title,
          messages: [],
        };

        rooms.push(room);
        return sendJson(res, { id: room.id, title: room.title }, 201);
      });
    }

    const roomIdMatch = apiPath.match(/^\/rooms\/([^/]+)(?:\/messages)?$/);
    if (roomIdMatch) {
      const roomId = roomIdMatch[1];
      const room = getRoomById(roomId);
      if (!room) {
        return sendError(res, 'Room not found', 404);
      }

      if (req.method === 'GET') {
        if (apiPath.endsWith('/messages')) {
          return sendJson(res, room.messages);
        }

        return sendJson(res, { id: room.id, title: room.title });
      }

      if (req.method === 'PATCH') {
        return parseBody(req, (err, body) => {
          if (err) {
            return sendError(res, 'Invalid JSON', 400);
          }

          const title = (body.title || '').trim();
          if (!title) {
            return sendError(res, 'Room title is required', 400);
          }

          room.title = title;
          return sendJson(res, { id: room.id, title: room.title });
        });
      }

      if (req.method === 'DELETE') {
        const index = rooms.findIndex((item) => item.id === roomId);
        if (index === -1) {
          return sendError(res, 'Room not found', 404);
        }
        rooms.splice(index, 1);
        return sendJson(res, { success: true });
      }

      if (req.method === 'POST' && apiPath.endsWith('/messages')) {
        return parseBody(req, (err, body) => {
          if (err) {
            return sendError(res, 'Invalid JSON', 400);
          }

          const text = (body.text || '').trim();
          const author = (body.author || '').trim();
          if (!text || !author) {
            return sendError(res, 'Message text and author are required', 400);
          }

          const message = {
            id: randomUUID(),
            text,
            author,
            createdAt: new Date().toISOString(),
          };

          room.messages.push(message);
          return sendJson(res, message, 201);
        });
      }
    }

    return sendError(res, 'Unknown API route', 404);
  }

  if (req.method === 'GET') {
    return sendStaticFile(req, res, pathname);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server started on http://localhost:${PORT}`);
});
