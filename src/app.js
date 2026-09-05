'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { ChatStore } = require('./store');
const { chatPage } = require('./views');

const publicDirectory = path.join(__dirname, '..', 'public');
const clean = (value, maximum) =>
  typeof value === 'string' ? value.trim().slice(0, maximum) : '';
const summary = (room) => ({
  id: room.id,
  name: room.name,
  messageCount: room.messages.length,
});

function json(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(value));
}

function failure(response, status, message) {
  json(response, status, { error: message });
}

async function requestBody(request) {
  let raw = '';

  for await (const chunk of request) {
    raw += chunk;

    if (raw.length > 1_000_000) {
      throw new Error('Request is too large');
    }
  }

  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw new Error('Invalid JSON');
  }
}

function createApp(options = {}) {
  const store =
    options.store ||
    new ChatStore(
      options.dataFile === undefined
        ? process.env.CHAT_DATA_FILE ||
          path.join(__dirname, '..', 'data', 'chat.json')
        : options.dataFile,
    );
  const streams = new Set();
  const roomsPayload = () => ({ rooms: store.rooms().map(summary) });
  const publish = (event, value) => {
    const data = `event: ${event}\ndata: ${JSON.stringify(value)}\n\n`;

    streams.forEach((stream) => stream.write(data));
  };

  async function api(request, response, url) {
    const parts = url.pathname.split('/').filter(Boolean);

    if (request.method === 'POST' && url.pathname === '/api/users') {
      const username = clean((await requestBody(request)).username, 32);

      if (!username) {
        return failure(response, 400, 'Username is required');
      }

      return json(response, 201, store.registerUser(username));
    }

    if (request.method === 'GET' && url.pathname === '/api/rooms') {
      return json(response, 200, roomsPayload());
    }

    if (request.method === 'POST' && url.pathname === '/api/rooms') {
      const name = clean((await requestBody(request)).name, 40);

      if (!name) {
        return failure(response, 400, 'Room name is required');
      }

      if (
        store
          .rooms()
          .some((item) => item.name.toLowerCase() === name.toLowerCase())
      ) {
        return failure(response, 409, 'A room with this name already exists');
      }

      const createdRoom = store.createRoom(name);

      publish('rooms', roomsPayload());

      return json(response, 201, summary(createdRoom));
    }

    if (parts[0] !== 'api' || parts[1] !== 'rooms' || !parts[2]) {
      return false;
    }

    const room = store.findRoom(parts[2]);

    if (!room) {
      return failure(response, 404, 'Room not found');
    }

    if (request.method === 'GET' && parts.length === 3) {
      return json(response, 200, room);
    }

    if (request.method === 'POST' && parts[3] === 'join') {
      return json(response, 200, room);
    }

    if (request.method === 'PATCH' && parts.length === 3) {
      const name = clean((await requestBody(request)).name, 40);

      if (!name) {
        return failure(response, 400, 'Room name is required');
      }

      if (
        store
          .rooms()
          .some(
            (item) =>
              item.id !== room.id &&
              item.name.toLowerCase() === name.toLowerCase(),
          )
      ) {
        return failure(response, 409, 'A room with this name already exists');
      }

      const updated = store.renameRoom(room.id, name);

      publish('rooms', roomsPayload());

      return json(response, 200, summary(updated));
    }

    if (request.method === 'DELETE' && parts.length === 3) {
      if (store.rooms().length === 1) {
        return failure(response, 409, 'The last room cannot be deleted');
      }
      store.deleteRoom(room.id);
      publish('room-deleted', { id: room.id, ...roomsPayload() });

      return json(response, 200, { deleted: true });
    }

    if (request.method === 'POST' && parts[3] === 'messages') {
      const input = await requestBody(request);
      const author = clean(input.author, 32);
      const text = clean(input.text, 2000);

      if (!author) {
        return failure(response, 400, 'Username is required');
      }

      if (!text) {
        return failure(response, 400, 'Message text is required');
      }

      const message = store.addMessage(room.id, author, text);

      publish('message', { roomId: room.id, message });

      return json(response, 201, message);
    }

    return false;
  }

  return http.createServer(async (request, response) => {
    const url = new URL(
      request.url,
      `http://${request.headers.host || 'localhost'}`,
    );

    try {
      if (request.method === 'GET' && url.pathname === '/') {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

        return response.end(chatPage());
      }

      if (request.method === 'GET' && url.pathname === '/api/events') {
        response.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });

        response.write(
          `event: rooms\ndata: ${JSON.stringify(roomsPayload())}\n\n`,
        );
        streams.add(response);
        request.on('close', () => streams.delete(response));

        return;
      }

      if (url.pathname.startsWith('/api/')) {
        const handled = await api(request, response, url);

        if (handled === false && !response.writableEnded) {
          failure(response, 404, 'Not found');
        }

        return;
      }

      if (
        request.method === 'GET' &&
        ['/app.js', '/styles.css'].includes(url.pathname)
      ) {
        const file = path.join(publicDirectory, url.pathname.slice(1));
        const type = url.pathname.endsWith('.js')
          ? 'text/javascript'
          : 'text/css';

        response.writeHead(200, {
          'Content-Type': `${type}; charset=utf-8`,
          'X-Content-Type-Options': 'nosniff',
        });

        return response.end(fs.readFileSync(file));
      }

      return failure(response, 404, 'Not found');
    } catch (error) {
      if (!response.writableEnded) {
        failure(response, 400, error.message || 'Bad request');
      }
    }
  });
}

module.exports = { createApp };
