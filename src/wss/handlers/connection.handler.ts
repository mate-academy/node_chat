import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';

import { authHandler } from './auth.handler';
import { roomManager } from '../room.manager';

export async function connectionHandler(ws: WebSocket, req: IncomingMessage) {
  const { roomId, userId } = await authHandler(ws, req);

  roomManager.join(roomId, userId, ws);

  ws.on('close', () => {
    roomManager.leave(roomId, ws);
  });
}
