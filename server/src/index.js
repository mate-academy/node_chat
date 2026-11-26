/* eslint-disable no-console */
import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = 5001;
const DEFAULT_ROOM = 'general';
let nextId = 1;

const rooms = new Map([
  [DEFAULT_ROOM, { id: DEFAULT_ROOM, name: 'General', messages: [] }],
]);
const clients = new Map();
const sseConns = new Map();

const roomList = () => {
  return [...rooms.values()].map(({ id, name }) => ({
    id,
    name,
  }));
};

function broadcastRooms() {
  clients.forEach((client, conn) => {
    conn.send({ type: 'rooms', rooms: roomList() });
  });
}

function broadcastToRoom(roomId, data) {
  clients.forEach((client, conn) => {
    if (client.roomId === roomId) {
      conn.send(data);
    }
  });
}

function enterRoom(conn, roomId) {
  const room = rooms.get(roomId);
  const client = clients.get(conn);

  if (!room || !client) {
    return;
  }

  client.roomId = roomId;

  conn.send({
    type: 'joined',
    roomId,
    messages: room.messages,
    rooms: roomList(),
  });
}

const handlers = {
  login(conn, { username }) {
    const name = String(username || '').trim();

    if (!name) {
      return;
    }

    clients.set(conn, { username: name, roomId: null });
    conn.send({ type: 'rooms', rooms: roomList() });
    enterRoom(conn, DEFAULT_ROOM);
  },

  joinRoom(conn, { roomId }) {
    enterRoom(conn, roomId);
  },

  createRoom(conn, { name }) {
    const roomName = String(name || '').trim();

    if (!roomName) {
      return;
    }

    const id = String(nextId);

    nextId += 1;
    rooms.set(id, { id, name: roomName, messages: [] });
    broadcastRooms();
    enterRoom(conn, id);
  },

  renameRoom(conn, { roomId, name }) {
    const room = rooms.get(roomId);
    const roomName = String(name || '').trim();

    if (!room || !roomName) {
      return;
    }

    room.name = roomName;
    broadcastRooms();
  },

  deleteRoom(conn, { roomId }) {
    if (roomId === DEFAULT_ROOM || !rooms.has(roomId)) {
      return;
    }

    rooms.delete(roomId);

    clients.forEach((client, clientConn) => {
      if (client.roomId === roomId) {
        enterRoom(clientConn, DEFAULT_ROOM);
      }
    });

    broadcastRooms();
  },

  message(conn, { text }) {
    const client = clients.get(conn);
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

function dispatch(conn, raw) {
  try {
    const data = JSON.parse(raw);
    const handler = handlers[data.type];

    if (handler) {
      handler(conn, data);
    }
  } catch (error) {
    console.error('Bad message', error);
  }
}

// ---------- HTTP (SSE + POST /send) ----------
function handleHttp(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();

    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('id');

  if (req.method === 'GET' && url.pathname === '/events' && id) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const conn = {
      send: (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      },
    };

    sseConns.set(id, conn);
    res.write(': connected\n\n');

    let cleaned = false;

    const cleanup = () => {
      if (cleaned) {
        return;
      }

      cleaned = true;

      if (sseConns.get(id) === conn) {
        sseConns.delete(id);
      }

      clients.delete(conn);
    };

    res.on('close', cleanup);
    req.socket.on('close', cleanup);

    return;
  }

  if (req.method === 'POST' && url.pathname === '/send' && id) {
    const conn = sseConns.get(id);

    if (!conn) {
      res.writeHead(404);
      res.end();

      return;
    }

    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      dispatch(conn, body);
      res.writeHead(204);
      res.end();
    });

    return;
  }

  res.writeHead(404);
  res.end();
}

const server = http.createServer(handleHttp);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const conn = {
    send: (data) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(data));
      }
    },
  };

  ws.on('message', (raw) => dispatch(conn, raw.toString()));
  ws.on('close', () => clients.delete(conn));
});

server.listen(PORT, () => {
  console.log(`Server on http://127.0.0.1:${PORT}`);
});
