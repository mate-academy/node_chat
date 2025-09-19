import express from 'express';
import cors from 'cors';

import { userRouter } from './routes/user.router.js';
import { roomRouter } from './routes/room.router.js';

export function createServer() {
  const server = express();

  server.use(express.json());

  server.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
      credentials: true,
    }),
  );

  server.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
  });

  server.use('/user', userRouter);
  server.use('/room', roomRouter);

  server.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return server;
}
