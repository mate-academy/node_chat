/* eslint-disable no-console */
'use strict';
import { WebSocketServer } from 'ws';

const PORT = 5001;
const wss = new WebSocketServer({ port: PORT });

const DEFAULT_ROOM = 'general';
let nextId = 1;

// roomId -> { id, name, messages: [] }
const rooms = new Map([
  [DEFAULT_ROOM, { id: DEFAULT_ROOM, name: 'General', messages: [] }],
]);
// ws -> { username, roomId }
const clients = new Map();

const send = (ws, data) => ws.readyState === 1 && ws.send(JSON.stringify(data));

const roomList = () =>
  [...rooms.values()].map(({ id, name }) => ({ id, name }));

const broadcastRooms = () => {
  for (const ws of clients.keys()) {
    send(ws, { type: 'rooms', rooms: roomList() });
  }
};

const broadcastToRoom = (roomId, data) => {
  for (const [ws, client] of clients) {
    if (client.roomId === roomId) {
      send(ws, data);
    }
  }
};

function joinRoom(ws, roomId) {
  const room = rooms.get(roomId);
  const client = clients.get(ws);

  if (!room || !client) {
    return;
  }

  client.roomId = roomId;
  // новий користувач бачить всю історію кімнати
  send(ws, { type: 'joined', roomId, messages: room.messages });
}

const handlers = {
  login(ws, { username }) {
    const name = String(username || '').trim();

    if (!name) {
      return;
    }
    clients.set(ws, { username: name, roomId: null });
    send(ws, { type: 'rooms', rooms: roomList() });
    joinRoom(ws, DEFAULT_ROOM);
  },

  joinRoom(ws, { roomId }) {
    joinRoom(ws, roomId);
  },

  createRoom(ws, { name }) {
    const roomName = String(name || '').trim();

    if (!roomName) {
      return;
    }

    const id = String(nextId++);

    rooms.set(id, { id, name: roomName, messages: [] });
    broadcastRooms();
    joinRoom(ws, id);
  },

  renameRoom(ws, { roomId, name }) {
    const room = rooms.get(roomId);
    const roomName = String(name || '').trim();

    if (!room || !roomName) {
      return;
    }
    room.name = roomName;
    broadcastRooms();
  },

  deleteRoom(ws, { roomId }) {
    if (roomId === DEFAULT_ROOM || !rooms.has(roomId)) {
      return;
    }
    rooms.delete(roomId);

    for (const [clientWs, client] of clients) {
      if (client.roomId === roomId) {
        joinRoom(clientWs, DEFAULT_ROOM);
      }
    }
    broadcastRooms();
  },

  message(ws, { text }) {
    const client = clients.get(ws);
    const room = client && rooms.get(client.roomId);
    const body = String(text || '').trim();

    if (!room || !body) {
      return;
    }

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: client.username,
      text: body,
      time: Date.now(),
    };

    room.messages.push(message);
    broadcastToRoom(room.id, { type: 'message', roomId: room.id, message });
  },
};

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);

      handlers[data.type]?.(ws, data);
    } catch (e) {
      console.error('Bad message', e);
    }
  });
  ws.on('close', () => clients.delete(ws));
});

console.log(`WebSocket server on ws://127.0.0.1:${PORT}`);
