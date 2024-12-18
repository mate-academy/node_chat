'use strict';

require('dotenv').config();

const WebSocket = require('ws');
const roomsController = require('./controllers/rooms.controller.js');

const PORT = process.env.PORT || 3001;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    let data;

    try {
      data = JSON.parse(message);
    } catch (error) {
      ws.send(
        JSON.stringify({ type: 'error', message: 'Invalid JSON format' }),
      );
    }

    switch (data.type) {
      case 'create':
        roomsController.create(ws, data);
        break;
      case 'join':
        roomsController.join(ws, data);
        break;
      case 'message':
        roomsController.sendMessage(ws, data);
        break;
      case 'rename':
        roomsController.rename(ws, data);
        break;
      case 'remove':
        roomsController.remove(ws, data);
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unexpected type' }));
    }
  });

  ws.on('close', () => {
    roomsController.onUserDisconnect(ws);
  });
});
