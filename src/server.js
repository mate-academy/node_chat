import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import { setupChatHandlers } from './socket/handlers.js';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  setupChatHandlers(io, socket);
});

server.listen(3000);
