'use strict';

require('dotenv/config');

const express = require('express');
const { WebSocketServer } = require('ws');
const { Room } = require('./models/Room');
const {
  handleRoomList,
  handleJoinRoom,
  handleCheckUserRights,
  handleAddMessage,
  handleCreateRoom,
  handleRenameRoom,
  handleDeleteRoom,
  initHandlers,
} = require('./utils/wsHandlers');

const PORT = process.env.PORT || 3005;
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Chat server is running');
});

const server = app.listen(PORT);
const wss = new WebSocketServer({ server });

const broadcastMessages = (newMessage, ws) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1 && ws.room === client.room) {
      client.send(JSON.stringify({ type: 'new-message', payload: newMessage }));
    }
  });
};

const broadcastRoomList = async () => {
  const allRooms = await Room.findAll();

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'room-list', payload: allRooms }));
    }
  });
};

initHandlers({ broadcastMessages, broadcastRoomList });

wss.on('connection', async (ws) => {
  broadcastRoomList(wss);

  ws.on('message', async (data) => {
    const { type, payload } = JSON.parse(data);

    const handlers = {
      'join-room': handleJoinRoom,
      'room-list': handleRoomList,
      'check-user-rights': handleCheckUserRights,
      'new-message': handleAddMessage,
      'create-room': handleCreateRoom,
      'rename-room': handleRenameRoom,
      'delete-room': handleDeleteRoom,
    };

    if (handlers[type]) {
      try {
        await handlers[type](ws, payload);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Error in ${type}: ${err.message}`);
      }
    }
  });
});
