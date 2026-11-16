import { send } from '../utils/send.js';

export function setUsername(ws, data) {
  const username = data.username?.trim();

  if (!username) {
    send(ws, { type: 'error', message: 'Name is required' });

    // eslint-disable-next-line no-useless-return
    return;
  }

  ws.username = username;
  send(ws, { type: 'username', username });
}
