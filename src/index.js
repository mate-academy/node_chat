'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { initSocket } = require('./socket.js');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '..', 'public')));

initSocket(io);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Chat server listening on port ${PORT}`);
});
