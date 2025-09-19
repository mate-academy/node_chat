'use strict';

import { createServer } from './createServer.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { messageServer } from './messageServer.js';
import { dbInit } from './db/db.init.js';

async function start() {
  try {
    await dbInit();

    const app = createServer();
    const httpServer = http.createServer(app);
    const io = new SocketIOServer(httpServer, {
      cors: { origin: '*', credentials: true },
    });

    messageServer(io);

    httpServer.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log('Server running on port 3000');
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start server:', err);
  }
}

start();
