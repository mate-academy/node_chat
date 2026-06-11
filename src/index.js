'use strict';

/* eslint-disable no-console */

require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env'),
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const { syncDatabase } = require('./models');
const setupSocketHandlers = require('./socket/handlers');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

setupSocketHandlers(io);

const start = async () => {
  await syncDatabase();

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
