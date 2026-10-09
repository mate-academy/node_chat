'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const rooms = [{ id: 'general', name: 'General', messages: [] }];

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(data));
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;

      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});

        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });

const findRoom = (id) => rooms.find((room) => room.id === id);

const serveStatic = (res, pathname) => {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${requestedPath}`);

  if (
    !filePath.startsWith(`${PUBLIC_DIR}${path.sep}`) &&
    filePath !== PUBLIC_DIR
  ) {
    sendJson(res, 403, { error: 'Forbidden' });

    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: 'File not found' });

      return;
    }

    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
    };

    res.writeHead(200, {
      'Content-Type':
        contentTypes[path.extname(filePath)] || 'application/octet-stream',
    });
    res.end(content);
  });
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  try {
    if (pathname.startsWith('/api/')) {
      if (req.method === 'GET' && pathname === '/api/rooms') {
        sendJson(
          res,
          200,
          rooms.map(({ id, name, messages }) => ({
            id,
            name,
            messageCount: messages.length,
          })),
        );

        return;
      }

      if (req.method === 'POST' && pathname === '/api/username') {
        const { username } = await readJson(req);

        if (typeof username !== 'string' || !username.trim()) {
          sendJson(res, 400, { error: 'Username is required' });

          return;
        }

        sendJson(res, 200, { username: username.trim() });

        return;
      }

      if (req.method === 'POST' && pathname === '/api/rooms') {
        const { name: requestedName } = await readJson(req);
        const roomName =
          typeof requestedName === 'string' ? requestedName.trim() : '';

        if (!roomName) {
          sendJson(res, 400, { error: 'Room name is required' });

          return;
        }

        if (
          rooms.some(
            (room) => room.name.toLowerCase() === roomName.toLowerCase(),
          )
        ) {
          sendJson(res, 409, {
            error: 'A room with that name already exists',
          });

          return;
        }

        const newRoom = {
          id: randomUUID(),
          name: roomName,
          messages: [],
        };

        rooms.push(newRoom);

        sendJson(res, 201, {
          id: newRoom.id,
          name: newRoom.name,
          messageCount: 0,
        });

        rooms.push(newRoom);

        sendJson(res, 201, {
          id: newRoom.id,
          name: newRoom.name,
          messageCount: 0,
        });

        return;
      }

      const roomMatch = pathname.match(/^\/api\/rooms\/([^/]+)$/);

      if (roomMatch) {
        const room = findRoom(decodeURIComponent(roomMatch[1]));

        if (req.method === 'PATCH') {
          if (!room) {
            sendJson(res, 404, { error: 'Room not found' });

            return;
          }

          const { name } = await readJson(req);
          const roomName = typeof name === 'string' ? name.trim() : '';

          if (!roomName) {
            sendJson(res, 400, { error: 'Room name is required' });

            return;
          }

          if (
            rooms.some(
              (item) =>
                item.id !== room.id &&
                item.name.toLowerCase() === roomName.toLowerCase(),
            )
          ) {
            sendJson(res, 409, {
              error: 'A room with that name already exists',
            });

            return;
          }

          room.name = roomName;
          sendJson(res, 200, { id: room.id, name: room.name });

          return;
        }

        if (req.method === 'DELETE') {
          if (!room) {
            sendJson(res, 404, { error: 'Room not found' });

            return;
          }

          if (room.id === 'general') {
            sendJson(res, 400, {
              error: 'The General room cannot be deleted',
            });

            return;
          }

          rooms.splice(rooms.indexOf(room), 1);
          sendJson(res, 200, { deleted: true });

          return;
        }
      }

      const messagesMatch = pathname.match(/^\/api\/rooms\/([^/]+)\/messages$/);

      if (messagesMatch) {
        const room = findRoom(decodeURIComponent(messagesMatch[1]));

        if (!room) {
          sendJson(res, 404, { error: 'Room not found' });

          return;
        }

        if (req.method === 'GET') {
          sendJson(res, 200, room.messages);

          return;
        }

        if (req.method === 'POST') {
          const { author, text } = await readJson(req);

          if (
            typeof author !== 'string' ||
            !author.trim() ||
            typeof text !== 'string' ||
            !text.trim()
          ) {
            sendJson(res, 400, {
              error: 'Author and message text are required',
            });

            return;
          }

          const message = {
            id: randomUUID(),
            author: author.trim(),
            time: new Date().toISOString(),
            text: text.trim(),
          };

          room.messages.push(message);
          sendJson(res, 201, message);

          return;
        }
      }

      sendJson(res, 404, { error: 'API route not found' });

      return;
    }

    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed' });

      return;
    }

    serveStatic(res, pathname);
  } catch (error) {
    if (!res.headersSent) {
      sendJson(res, 400, { error: error.message || 'Bad request' });
    }
  }
});

server.listen(PORT);
