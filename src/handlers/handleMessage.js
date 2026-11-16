import { send } from '../utils/send.js';
import { chatHandler } from './chat.handler.js';
import { roomHandler } from './room.handler.js';

export function handleMessage(wss, ws, rawData) {
  let data;

  try {
    data = JSON.parse(rawData);
  } catch {
    send(ws, { type: 'error', message: 'Invalid JSON' });

    // eslint-disable-next-line no-useless-return
    return;
  }

  switch (data.type) {
    case 'ping':
      send(ws, { type: 'pong' });
      break;
    case 'createRoom':
      roomHandler.createRoom(wss, ws, data);
      break;
    case 'renameRoom':
      roomHandler.renameRoom(wss, ws, data);
      break;
    case 'deleteRoom':
      roomHandler.deleteRoom(wss, ws, data);
      break;
    case 'join':
      chatHandler.join(ws, data);
      break;
    case 'message':
      chatHandler.sendMessage(wss, ws, data);
      break;

    default:
      send(ws, { type: 'error', message: `Unknown type: ${data.type}` });
  }
}
