import { send } from './send.js';
import { WebSocket } from 'ws';

export function broadcast(wss, data, filter) {
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (!filter || filter(client) === true)
    ) {
      send(client, data);
    }
  });
}
