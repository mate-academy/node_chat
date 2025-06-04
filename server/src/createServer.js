import express from 'express';
import cors from 'cors';
import { usersRouter } from './routers/usersRouter.js';
import { roomsRouter } from './routers/roomsRouter.js';

export function createServer() {
  const server = express();

  server.use(cors());

  server.get('/', (req, res) => {
    res.status(200).send('Hello node');
  });

  server.use('/', usersRouter);

  server.use('/', roomsRouter);

  return server;
}
