'use strict';
/* eslint-disable no-console */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8080 });

const rooms = {};

function broadcast(roomId, data) {
  const room = rooms[roomId];

  if (!room) {
    return;
  }

  room.users.forEach((user) => {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  let currentRoom = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'setUsername':
        ws.username = data.userName;
        ws.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        break;

      case 'createRoom':
        const roomId = uuidv4();

        rooms[roomId] = { name: data.roomName, messages: [], users: [] };

        ws.send(
          JSON.stringify({
            type: 'roomCreated',
            roomId,
            roomName: data.roomName,
          }),
        );
        break;

      case 'joinRoom':
        if (currentRoom && rooms[currentRoom]) {
          rooms[currentRoom].users = rooms[currentRoom].users.filter(
            (user) => user.ws !== ws,
          );
        }

        currentRoom = data.roomId;

        if (!rooms[currentRoom]) {
          console.error(`Attempt to join non-existent room: ${currentRoom}`);

          return;
        }

        rooms[currentRoom].users.push({
          ws,
          username: ws.username,
          color: ws.color,
        });

        ws.send(
          JSON.stringify({
            type: 'roomJoined',
            roomId: currentRoom,
            messages: rooms[currentRoom].messages,
          }),
        );
        break;

      case 'sendMessage':
        if (!currentRoom || !rooms[currentRoom]) {
          return;
        }

        const messageData = {
          author: ws.username,
          color: ws.color,
          time: new Date().toISOString(),
          text: data.text,
        };

        rooms[currentRoom].messages.push(messageData);
        broadcast(currentRoom, { type: 'newMessage', message: messageData });
        break;

      case 'renameRoom':
        if (!rooms[data.roomId]) {
          return;
        }

        rooms[data.roomId].name = data.newName;

        broadcast(data.roomId, {
          type: 'roomRenamed',
          roomId: data.roomId,
          newName: data.newName,
        });
        break;

      case 'deleteRoom':
        if (!rooms[data.roomId]) {
          return;
        }

        broadcast(data.roomId, { type: 'roomDeleted', roomId: data.roomId });
        delete rooms[data.roomId];
        break;
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].users = rooms[currentRoom].users.filter(
        (user) => user.ws !== ws,
      );
    }
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
