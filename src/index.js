'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { registerSocketHandlers } = require('./controllers/socketController');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Register socket event handlers
registerSocketHandlers(io);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Chat server running on http://localhost:${PORT}`);
});
