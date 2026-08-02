'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { registerSocketHandlers } = require('./server/socket');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

registerSocketHandlers(io);

server.listen(PORT, () => {
  process.stdout.write(`Server is listening on port ${PORT}\n`);
});
