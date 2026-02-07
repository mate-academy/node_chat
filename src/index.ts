import * as http from 'http';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { Router, serveStatic, jsonResponse, getContentType } from './router.js';
import { store } from './store.js';
import {
  handleConnection,
  handleDisconnect,
  handleMessage,
} from './ws-handler.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ?? 3000;

const router = new Router();

// Serve index.html
router.get('/', (req, res) => {
  serveStatic(res, path.join(currentDir, 'public', 'index.html'), 'text/html');
});

// API: get rooms
router.get('/api/rooms', (req, res) => {
  const rooms = store.getAllRooms().map((r) => ({ id: r.id, name: r.name }));

  jsonResponse(res, { rooms });
});

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();

    return;
  }

  // Try router
  const handled = await router.handle(req, res);

  if (handled) {
    return;
  }

  // Serve static files from public
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  const filePath = path.join(currentDir, 'public', url.pathname);
  const ext = path.extname(filePath);

  if (ext) {
    serveStatic(res, filePath, getContentType(ext));

    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not Found');
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  handleConnection(ws);

  ws.on('message', (data) => {
    handleMessage(ws, data.toString());
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    handleDisconnect(ws);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
