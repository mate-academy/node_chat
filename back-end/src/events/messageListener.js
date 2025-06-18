import { emitter } from './eventEmitter.js';
import { wss } from '../index.js';

emitter.on('message', (message) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(message));
  }
});
