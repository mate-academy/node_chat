'use strict';

const cryptoModule = require('crypto');
const fs = require('fs');
const fsp = require('fs/promises');
const http = require('http');
const path = require('path');

const DEFAULT_PORT = 3000;
const PUBLIC_DIRECTORY = path.join(__dirname, 'public');
const DEFAULT_DATA_FILE = path.join(__dirname, 'data', 'chat-data.json');
const MAX_BODY_SIZE = 1024 * 1024;

const STATIC_FILES = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
};

function logError(error) {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);

  process.stderr.write(`${message}\n`);
}

function createDefaultData() {
  return {
    rooms: [
      {
        id: 'general',
        name: 'General',
        createdAt: new Date().toISOString(),
      },
    ],
    messages: {
      general: [],
    },
  };
}

function isValidData(data) {
  return (
    data &&
    Array.isArray(data.rooms) &&
    data.rooms.length > 0 &&
    data.messages &&
    typeof data.messages === 'object' &&
    data.rooms.every(
      (room) =>
        room &&
        typeof room.id === 'string' &&
        typeof room.name === 'string' &&
        Array.isArray(data.messages[room.id]),
    )
  );
}

async function loadData(dataFile) {
  try {
    const fileContent = await fsp.readFile(dataFile, 'utf8');
    const data = JSON.parse(fileContent);

    if (isValidData(data)) {
      return data;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logError(`Could not read the chat data: ${error.message}`);
    }
  }

  return createDefaultData();
}

function normalizeText(value, maxLength) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function sendJson(response, statusCode, data) {
  const body = JSON.stringify(data);

  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  response.end(body);
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, { error: message });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.setEncoding('utf8');

    request.on('data', (chunk) => {
      body += chunk;

      if (Buffer.byteLength(body) > MAX_BODY_SIZE) {
        reject(
          Object.assign(new Error('Request body is too large'), {
            status: 413,
          }),
        );
        request.destroy();
      }
    });

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function getRoomSummaries(data) {
  return data.rooms.map((room) => {
    const roomMessages = data.messages[room.id];

    return {
      ...room,
      messageCount: roomMessages.length,
      lastMessage: roomMessages.at(-1) || null,
    };
  });
}

function createChatServer(options = {}) {
  const dataFile =
    options.dataFile || process.env.CHAT_DATA_FILE || DEFAULT_DATA_FILE;
  const clients = new Set();
  let data;
  let saveQueue = Promise.resolve();

  function persistData() {
    const snapshot = JSON.stringify(data, null, 2);

    saveQueue = saveQueue
      .then(async () => {
        await fsp.mkdir(path.dirname(dataFile), { recursive: true });

        const temporaryFile = `${dataFile}.${process.pid}.tmp`;

        await fsp.writeFile(temporaryFile, `${snapshot}\n`, 'utf8');
        await fsp.rename(temporaryFile, dataFile);
      })
      .catch((error) => {
        logError(`Could not save the chat data: ${error.message}`);
      });

    return saveQueue;
  }

  function broadcast(event, payload) {
    const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

    clients.forEach((client) => client.write(message));
  }

  function broadcastRooms() {
    broadcast('rooms', getRoomSummaries(data));
  }

  async function serveStaticFile(requestPath, response) {
    const file = STATIC_FILES[requestPath];

    if (!file) {
      return false;
    }

    try {
      const contents = await fsp.readFile(path.join(PUBLIC_DIRECTORY, file[0]));

      response.writeHead(200, {
        'Content-Type': file[1],
        'Content-Length': contents.length,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(contents);
    } catch {
      sendError(response, 500, 'Could not load the application');
    }

    return true;
  }

  function findRoom(roomId) {
    return data.rooms.find((room) => room.id === roomId);
  }

  async function handleApiRequest(request, response, url) {
    if (request.method === 'GET' && url.pathname === '/api/rooms') {
      sendJson(response, 200, getRoomSummaries(data));

      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/users') {
      const body = await readJsonBody(request);
      const username = normalizeText(body.username, 30);

      if (!username) {
        sendError(response, 400, 'Username is required');

        return;
      }

      sendJson(response, 200, { username });

      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/rooms') {
      const body = await readJsonBody(request);
      const name = normalizeText(body.name, 50);

      if (!name) {
        sendError(response, 400, 'Room name is required');

        return;
      }

      if (
        data.rooms.some(
          (existingRoom) =>
            existingRoom.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        sendError(response, 409, 'A room with this name already exists');

        return;
      }

      const newRoom = {
        id: cryptoModule.randomUUID(),
        name,
        createdAt: new Date().toISOString(),
      };

      data.rooms.push(newRoom);
      data.messages[newRoom.id] = [];
      await persistData();
      sendJson(response, 201, newRoom);
      broadcastRooms();

      return;
    }

    const roomRoute = url.pathname.match(/^\/api\/rooms\/([^/]+)$/);
    const joinRoute = url.pathname.match(/^\/api\/rooms\/([^/]+)\/join$/);
    const messagesRoute = url.pathname.match(
      /^\/api\/rooms\/([^/]+)\/messages$/,
    );
    const roomId = decodeURIComponent(
      (joinRoute && joinRoute[1]) ||
        (messagesRoute && messagesRoute[1]) ||
        (roomRoute && roomRoute[1]) ||
        '',
    );
    const room = findRoom(roomId);

    if (roomRoute || joinRoute || messagesRoute) {
      if (!room) {
        sendError(response, 404, 'Room not found');

        return;
      }
    }

    if (request.method === 'GET' && messagesRoute) {
      sendJson(response, 200, data.messages[room.id]);

      return;
    }

    if (request.method === 'POST' && joinRoute) {
      const body = await readJsonBody(request);
      const username = normalizeText(body.username, 30);

      if (!username) {
        sendError(response, 400, 'Username is required');

        return;
      }

      sendJson(response, 200, {
        room,
        messages: data.messages[room.id],
      });

      return;
    }

    if (request.method === 'POST' && messagesRoute) {
      const body = await readJsonBody(request);
      const author = normalizeText(body.author, 30);
      const text = normalizeText(body.text, 1000);

      if (!author || !text) {
        sendError(response, 400, 'Author and message text are required');

        return;
      }

      const message = {
        id: cryptoModule.randomUUID(),
        author,
        time: new Date().toISOString(),
        text,
      };

      data.messages[room.id].push(message);
      await persistData();
      sendJson(response, 201, message);
      broadcast('message', { roomId: room.id, message });
      broadcastRooms();

      return;
    }

    if (request.method === 'PATCH' && roomRoute) {
      const body = await readJsonBody(request);
      const name = normalizeText(body.name, 50);

      if (!name) {
        sendError(response, 400, 'Room name is required');

        return;
      }

      if (
        data.rooms.some(
          (item) =>
            item.id !== room.id &&
            item.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        sendError(response, 409, 'A room with this name already exists');

        return;
      }

      room.name = name;
      await persistData();
      sendJson(response, 200, room);
      broadcastRooms();

      return;
    }

    if (request.method === 'DELETE' && roomRoute) {
      if (data.rooms.length === 1) {
        sendError(response, 409, 'The last room cannot be deleted');

        return;
      }

      data.rooms = data.rooms.filter((item) => item.id !== room.id);
      delete data.messages[room.id];
      await persistData();
      response.writeHead(204);
      response.end();
      broadcast('room-deleted', { roomId: room.id });
      broadcastRooms();

      return;
    }

    sendError(response, 404, 'Endpoint not found');
  }

  const server = http.createServer(async (request, response) => {
    const url = new URL(
      request.url,
      `http://${request.headers.host || 'localhost'}`,
    );

    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');

    if (request.method === 'GET' && url.pathname === '/api/events') {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      response.write(
        `event: rooms\ndata: ${JSON.stringify(getRoomSummaries(data))}\n\n`,
      );
      clients.add(response);

      request.on('close', () => clients.delete(response));

      return;
    }

    try {
      if (url.pathname.startsWith('/api/')) {
        await handleApiRequest(request, response, url);

        return;
      }

      if (
        request.method === 'GET' &&
        (await serveStaticFile(url.pathname, response))
      ) {
        return;
      }

      sendError(response, 404, 'Page not found');
    } catch (error) {
      if (!response.headersSent) {
        sendError(
          response,
          error.status || 500,
          error.status ? error.message : 'Server error',
        );
      }

      if (!error.status) {
        logError(error);
      }
    }
  });

  const keepAlive = setInterval(() => {
    clients.forEach((client) => client.write(': keep-alive\n\n'));
  }, 25000);

  server.on('close', () => {
    clearInterval(keepAlive);
    clients.forEach((client) => client.end());
    clients.clear();
  });

  server.ready = loadData(dataFile).then((loadedData) => {
    data = loadedData;

    if (!fs.existsSync(dataFile)) {
      return persistData();
    }

    return undefined;
  });

  return server;
}

async function startServer() {
  const server = createChatServer();
  const port = Number(process.env.PORT) || DEFAULT_PORT;

  await server.ready;

  server.listen(port, () => {
    process.stdout.write(`Chat is running at http://localhost:${port}\n`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    logError(error);
    process.exitCode = 1;
  });
}

module.exports = { createChatServer };
