import { WebSocketServer } from 'ws';
import { handleMessage } from './handlers/handleMessage.js';
import { send } from './utils/send.js';
import { roomService } from './services/room.service.js';

const PORT = process.env.PORT || 5000;

const wss = new WebSocketServer({ port: PORT });

// eslint-disable-next-line no-console
console.log(`server is running on ${PORT}`);

wss.on('connection', (ws) => {
  // eslint-disable-next-line no-console
  console.log('client connected');
  send(ws, { type: 'rooms', rooms: roomService.getAll() });

  ws.on('message', (data) => {
    const text = data.toString();

    // eslint-disable-next-line no-console
    console.log('received', text);

    handleMessage(wss, ws, text);
  });

  ws.on('close', () => {
    // eslint-disable-next-line no-console
    console.log('client disconnected');
  });
});
