import 'dotenv/config';
import { WebSocketServer, WebSocket } from 'ws';
import EventEmitter from 'events';

const PORT = process.env.WS_PORT || 3010;

const wss = new WebSocketServer({ port: PORT });
export const eventEmitter = new EventEmitter();

console.log(`WebSocket server is running on port ${PORT}`);

const sendData = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

eventEmitter.on('messageAdd', (data) => {
  const preparedPayload = { type: 'messageAdd', payload: data };
  sendData(preparedPayload);
});

eventEmitter.on('removeRoom', (data) => {
  const preparedPayload = { type: 'removeRoom', payload: data };
  sendData(preparedPayload);
});

eventEmitter.on('updateRoom', (data) => {
  const preparedPayload = { type: 'updateRoom', payload: data };
  sendData(preparedPayload);
});

eventEmitter.on('createRoom', (data) => {
  const preparedPayload = { type: 'createRoom', payload: data };
  sendData(preparedPayload);
});
