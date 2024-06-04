'use strict';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { handleConnection } from './utils/socketConnection.js';

const PORT = process.env.PORT || 5701;

const app = express();

app.use(cors());

const httpServer = createServer(app);

export const io = new Server(httpServer);

io.on('connection', handleConnection);

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on ', PORT);
});
