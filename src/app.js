import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { initSocket } from './socket/socket.js';

export function createServer() {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Server is running');
  });

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  initSocket(io);

  return { app, httpServer };
}
