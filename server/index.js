// server/index.js (CommonJS)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { EventEmitter } = require('events');
const { createServer } = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

/**
 * Tipos (comentários):
 * Message: { id, roomId, author, text, time }
 * Room:    { id, name }
 */

const messageBus = new EventEmitter();

// “DB” em memória
const rooms = [{ id: 'general', name: 'General' }];
const messages = [];

function nowISO() {
  return new Date().toISOString();
}

/* =========================
 *       AUTH SIMPLES
 * ========================= */
app.post('/auth/login', (req, res) => {
  const { username } = req.body || {};
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'username required' });
  }
  return res.status(200).json({ username });
});

/* =========================
 *          ROOMS
 * ========================= */
app.get('/rooms', (_req, res) => res.json(rooms));

app.post('/rooms', (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });

  const id = name.toLowerCase().replace(/\s+/g, '-');
  if (rooms.some((r) => r.id === id)) {
    return res.status(409).json({ error: 'room exists' });
  }
  const room = { id, name };
  rooms.push(room);
  return res.status(201).json(room);
});

app.patch('/rooms/:id', (req, res) => {
  const room = rooms.find((r) => r.id === req.params.id);
  if (!room) return res.status(404).json({ error: 'room not found' });

  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });

  room.name = name;
  return res.json(room);
});

app.delete('/rooms/:id', (req, res) => {
  const idx = rooms.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'room not found' });

  rooms.splice(idx, 1);
  return res.status(204).end();
});

/* =========================
 *        MENSAGENS
 * ========================= */
app.get('/rooms/:id/messages', (req, res) => {
  const { id } = req.params;
  const roomExists = rooms.some((r) => r.id === id);
  if (!roomExists) return res.status(404).json({ error: 'room not found' });

  return res.json(messages.filter((m) => m.roomId === id));
});

app.post('/messages', (req, res) => {
  const { roomId, author, text } = req.body || {};
  if (!roomId || !author || !text) {
    return res.status(400).json({ error: 'roomId, author, text required' });
  }
  if (!rooms.some((r) => r.id === roomId)) {
    return res.status(404).json({ error: 'room not found' });
  }

  const msg = { id: randomUUID(), roomId, author, text, time: nowISO() };
  messages.push(msg);

  // Notifica todos os mecanismos de tempo real
  messageBus.emit('message', msg);

  return res.status(201).json(msg);
});

/* =========================
 *      HTTP + WEBSOCKET
 * ========================= */
const httpServer = createServer(app);

// Defina um "path" estável para o WS (ws://localhost:3000/ws)
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// Broadcast por WS sempre que chegar nova mensagem
messageBus.on('message', (data) => {
  const payload = JSON.stringify({ type: 'message', payload: data });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (_) {
        // ignora erros de envio
      }
    }
  }
});

// Heartbeat para encerrar conexões mortas
const HEARTBEAT_INTERVAL = 30_000;
function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (socket) => {
  socket.isAlive = true;
  socket.on('pong', heartbeat);

  // opcional: mensagem de boas-vindas
  try {
    socket.send(JSON.stringify({ type: 'hello', payload: { time: nowISO() } }));
  } catch (_) {}

  socket.on('message', (raw) => {
    // caso o cliente envie algo pelo WS, apenas ecoamos
    const text = raw.toString();
    const payload = JSON.stringify({ type: 'echo', payload: text });
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(payload);
      } catch (_) {}
    }
  });

  socket.on('close', () => {
    // nada específico
  });
});

const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      try {
        ws.terminate();
      } catch (_) {}
      continue;
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch (_) {}
  }
}, HEARTBEAT_INTERVAL);

wss.on('close', () => clearInterval(interval));

/* =========================
 *   B1) LONG POLLING (LP)
 * ========================= */
// roomId -> Set(res)
const waiting = new Map();

app.get('/lp/rooms/:id/updates', (req, res) => {
  const { id } = req.params;

  // timeout de segurança para evitar conexões penduradas
  req.setTimeout(65_000); // 65s
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // registra o response da sala
  if (!waiting.has(id)) waiting.set(id, new Set());
  waiting.get(id).add(res);

  // se o cliente fechar a conexão, removemos
  req.on('close', () => {
    const set = waiting.get(id);
    if (set) set.delete(res);
  });
});

// Quando chega nova mensagem, respondemos quem está aguardando (por sala)
messageBus.on('message', (msg) => {
  const set = waiting.get(msg.roomId);
  if (set && set.size) {
    const data = JSON.stringify({ type: 'message', payload: msg });
    for (const res of set) {
      try {
        res.end(data);
      } catch (_) {}
    }
    set.clear();
  }
});

/* =========================
 * B2) SERVER-SENT EVENTS
 * ========================= */
// roomId -> Set(res)
const sseClients = new Map();

app.get('/sse/rooms/:id/stream', (req, res) => {
  const { id } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  // envia um byte inicial para “abrir” o stream nos proxies
  res.write('\n');

  if (!sseClients.has(id)) sseClients.set(id, new Set());
  sseClients.get(id).add(res);

  // limpeza quando o cliente desconectar
  req.on('close', () => {
    const set = sseClients.get(id);
    if (set) set.delete(res);
  });
});

// Push de eventos SSE por sala
messageBus.on('message', (msg) => {
  const set = sseClients.get(msg.roomId);
  if (set && set.size) {
    const data = `data: ${JSON.stringify({ type: 'message', payload: msg })}\n\n`;
    for (const res of set) {
      try {
        res.write(data);
      } catch (_) {}
    }
  }
});

/* =========================
 *      HEALTHCHECK
 * ========================= */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime(), now: nowISO() });
});

/* =========================
 *        START SERVER
 * ========================= */
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`WS path: ws://localhost:${PORT}/ws`);
});
