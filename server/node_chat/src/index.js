'use strict';

const { WebSocketServer } = require('ws');
const { randomUUID } = require('crypto');
const { loadData, saveData } = require('./storage');
const {
  validateUsername,
  validateMessageText,
  validateRoomName,
} = require('./validation');

const PORT = process.env.PORT || 5000;
const wss = new WebSocketServer({ port: PORT });

const rooms = new Map();
const savedData = loadData();

if (savedData.rooms.length > 0) {
  savedData.rooms.forEach((room) => rooms.set(room.id, room));
} else {
  const id = randomUUID();
  rooms.set(id, { id, name: 'General', messages: [] });
}

function persist() {
  saveData(rooms);
}

function getRoomsList() {
  return [...rooms.values()].map(({ id, name }) => ({ id, name }));
}

function getActiveUsernames() {
  const usernames = [];
  wss.clients.forEach((client) => {
    if (client.username) usernames.push(client.username);
  });
  return usernames;
}

function broadcastToAll(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(payload);
  });
}

function broadcastToRoom(roomId, data, exclude = null) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (
      client.readyState === client.OPEN &&
      client.roomId === roomId &&
      client !== exclude
    ) {
      client.send(payload);
    }
  });
}

function sendTo(ws, data) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
}

function sendError(ws, message) {
  sendTo(ws, { type: 'error', message });
}

wss.on('connection', (ws) => {
  ws.username = null;
  ws.roomId = null;
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (raw) => {
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return sendError(ws, 'Invalid JSON');
    }

    switch (data.type) {
      case 'join': {
        const usernameError = validateUsername(
          data.username,
          getActiveUsernames(),
        );

        if (usernameError) {
          return sendError(ws, usernameError);
        }

        ws.username = data.username;
        const targetRoom = rooms.get(data.roomId) || getRoomsList()[0];
        ws.roomId = targetRoom.id;

        const room = rooms.get(ws.roomId);

        sendTo(ws, { type: 'joined', username: ws.username });
        sendTo(ws, { type: 'rooms', rooms: getRoomsList() });
        sendTo(ws, {
          type: 'history',
          roomId: room.id,
          messages: room.messages,
        });
        break;
      }

      case 'switch_room': {
        const room = rooms.get(data.roomId);
        if (!room) return sendError(ws, 'Room not found');

        ws.roomId = room.id;
        sendTo(ws, {
          type: 'history',
          roomId: room.id,
          messages: room.messages,
        });
        break;
      }

      case 'message': {
        if (!ws.username || !ws.roomId) {
          return sendError(ws, 'Join a room first');
        }

        const textError = validateMessageText(data.text);
        if (textError) return sendError(ws, textError);

        const room = rooms.get(ws.roomId);
        if (!room) return sendError(ws, 'Room not found');

        const message = {
          author: ws.username,
          text: data.text.trim(),
          time: new Date().toISOString(),
        };

        room.messages.push(message);
        persist();

        broadcastToRoom(room.id, { type: 'message', roomId: room.id, message });
        break;
      }

      case 'typing': {
        if (!ws.username || !ws.roomId) return;

        broadcastToRoom(
          ws.roomId,
          { type: 'typing', roomId: ws.roomId, username: ws.username },
          ws,
        );
        break;
      }

      case 'create_room': {
        const nameError = validateRoomName(data.name);
        if (nameError) return sendError(ws, nameError);

        const id = randomUUID();
        rooms.set(id, { id, name: data.name.trim(), messages: [] });
        persist();

        broadcastToAll({ type: 'rooms', rooms: getRoomsList() });
        break;
      }

      case 'rename_room': {
        const room = rooms.get(data.roomId);
        if (!room) return sendError(ws, 'Room not found');

        const nameError = validateRoomName(data.name);
        if (nameError) return sendError(ws, nameError);

        room.name = data.name.trim();
        persist();

        broadcastToAll({ type: 'rooms', rooms: getRoomsList() });
        break;
      }

      case 'delete_room': {
        if (!rooms.has(data.roomId)) return sendError(ws, 'Room not found');
        if (rooms.size === 1) {
          return sendError(ws, 'Cannot delete the last room');
        }

        rooms.delete(data.roomId);
        persist();

        const fallback = getRoomsList()[0];

        wss.clients.forEach((client) => {
          if (client.roomId === data.roomId) {
            client.roomId = fallback.id;
            sendTo(client, {
              type: 'history',
              roomId: fallback.id,
              messages: rooms.get(fallback.id).messages,
            });
          }
        });

        broadcastToAll({ type: 'rooms', rooms: getRoomsList() });
        break;
      }

      default:
        sendError(ws, `Unknown type: ${data.type}`);
    }
  });

  ws.on('close', () => {
    if (ws.username && ws.roomId) {
      broadcastToRoom(ws.roomId, {
        type: 'typing_stop',
        roomId: ws.roomId,
        username: ws.username,
      });
    }
  });
});

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => clearInterval(heartbeatInterval));

process.stdout.write(`WebSocket server is running on ws://localhost:${PORT}\n`);
