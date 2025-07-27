/* eslint-disable no-console */
'use strict';

require('dotenv/config');

const express = require('express');
const { WebSocketServer } = require('ws');
const { ChatRoom } = require('./models/ChatRoom');

const {
  emitRoomList,
  joinRoom,
  verifyEditor,
  submitMessage,
  createNewRoom,
  renameExistingRoom,
  removeRoom,
  configureHandlers,
} = require('./utils/ws');

const PORT = process.env.PORT || 3005;
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Real-time chat backend is live');
});

const server = app.listen(PORT);
const wss = new WebSocketServer({ server });

const pushMessageToClients = (messageData, originClient) => {
  wss.clients.forEach((client) => {
    const isSameRoom = client.roomTitle === originClient.roomTitle;
    const isActive = client.readyState === 1;

    if (isSameRoom && isActive) {
      client.send(
        JSON.stringify({
          type: 'message-received',
          payload: messageData,
        }),
      );
    }
  });
};

const pushRoomListToClients = async () => {
  const rooms = await ChatRoom.findAll();

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: 'rooms-updated',
          payload: rooms,
        }),
      );
    }
  });
};

configureHandlers({
  broadcastMessages: pushMessageToClients,
  broadcastRoomList: pushRoomListToClients,
});

wss.on('connection', async (ws) => {
  pushRoomListToClients();

  ws.on('message', async (dataBuffer) => {
    let parsed;

    try {
      parsed = JSON.parse(dataBuffer);
    } catch (err) {
      console.warn('Invalid message format:', err.message);

      return;
    }

    const { type, payload } = parsed;

    const actionMap = {
      'join-room': joinRoom,
      'list-rooms': emitRoomList,
      'verify-rights': verifyEditor,
      'send-message': submitMessage,
      'add-room': createNewRoom,
      'update-room': renameExistingRoom,
      'remove-room': removeRoom,
    };

    const handler = actionMap[type];

    if (handler) {
      try {
        await handler(ws, payload);
      } catch (error) {
        console.error(`Failed in ${type}:`, error.message);
      }
    }
  });
});
