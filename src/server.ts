import 'dotenv/config';

import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import app from './app.js';
import { initializeWebSocket } from './websocket/connection.js';

const PORT = process.env.PORT || 3000;

const server = createServer(app);

const wss = new WebSocketServer({ server });

initializeWebSocket(wss);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
