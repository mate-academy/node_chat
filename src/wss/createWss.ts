import { Server } from 'http';
import { WebSocketServer, Server as WBServer } from 'ws';

import { addListeners } from './addListeners';
import { errorHandler } from './handlers/error.handler';
import { connectionHandler } from './handlers/connection.handler';

export function createWss(server: Server): WBServer {
  const wws = new WebSocketServer({ server });

  wws.on('connection', errorHandler(connectionHandler));

  addListeners();

  return wws;
}
