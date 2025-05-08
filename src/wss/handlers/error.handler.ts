import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { WssError } from '../../exceptions/wss.error';

export function errorHandler(
  handler: (ws: WebSocket, req: IncomingMessage) => Promise<void> | void,
) {
  return async (ws: WebSocket, req: IncomingMessage) => {
    try {
      await handler(ws, req);
    } catch (err) {
      if (err instanceof WssError) {
        ws.send(JSON.stringify({ error: err.message }));
        ws.close(err.code, err.message);

        return;
      }

      ws.send(JSON.stringify({ error: 'Internal server error' }));
      ws.close(1011, 'Internal server error');
    }
  };
}
