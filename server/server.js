'use strict';

import { WebSocketServer } from 'ws';
import { createServer } from './createServer.js';
import 'dotenv/config';
import { createMessage } from './controllers/messages.controller.js';
import { getCurrentUser } from './controllers/users.controller.js';
import { Users } from './models/users.js';
import { getUsersByIds } from './services/user.services.js';

const { SERVER_PORT } = process.env;
const rooms = new Map();
const clientData = new Map();

async function joinRoom(ws, roomId, userId) {
  if (roomId && userId) {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(ws);

    clientData.set(ws, { roomId, userId });
  } else {
    broadcastErrorToUser(roomId, ws);
  }

  clientData.set(ws, { roomId, userId });

  const userIdsInRoom = [];

  clientData.forEach((client) => {
    if (client.roomId === roomId) {
      userIdsInRoom.push(client.userId);
    }
  });
  const userInRoom = await getUsersByIds(userIdsInRoom);
  const usersName = [];
  userInRoom.forEach((user) => {
    usersName.push(user.dataValues.userName);
  });

  const messageToBroadcast = {
    type: 'userJoin',
    payload: usersName,
  };
  broadcastToRoom(roomId, messageToBroadcast);
}

async function leaveRoom(ws, roomId, userId) {
  if (roomId && rooms.has(roomId)) {
    rooms.get(roomId).delete(ws);
    if (rooms.get(roomId).size === 0) {
      rooms.delete(roomId);
    }
  }

  clientData.delete(ws);

  const userData = await Users.findByPk(userId);
  const userName = userData?.dataValues?.userName;

  if (!userName) {
    console.error('No user found');
    return;
  }
  const messageToBroadcast = {
    type: 'userLeft',
    payload: userName,
  };
  broadcastToRoom(roomId, messageToBroadcast, [ws]);
}

const broadcastToRoom = (roomId, messageObject, excludeClient = []) => {
  const room = rooms.get(roomId);

  console.log(
    `Broadcasting to room ${roomId} (${room?.size} clients):`,
    messageObject
  );

  if (!room) {
    console.error('Room not found');
    return;
  }

  room.forEach((client) => {
    if (
      !excludeClient.includes(client) &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(JSON.stringify(messageObject));
    }
  });
};

const broadcastErrorToUser = (roomId, ws) => {
  const messageToBroadcast = {
    type: 'error',
    payload: 'An error occurred while processing your request.',
  };

  const excludeClients = [];

  Array.from(clientData.keys()).forEach((cl) => {
    if (cl !== ws) {
      excludeClients.push(cl);
    }
  });

  broadcastToRoom(roomId, messageToBroadcast, excludeClients);
};

const server = createServer().listen(SERVER_PORT, () => {
  console.log('Server is running on localhost:5700');
});

export const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case 'join': {
          const { roomId, userId } = data.payload;
          joinRoom(ws, roomId, userId);
          break;
        }

        case 'create': {
          const { roomId, userId, text } = data.payload;

          const sender = clientData.get(ws);

          if (roomId && userId && sender) {
            const messageCreated = await createMessage({
              roomId,
              userId,
              text,
            });

            const messageToBroadcast = {
              type: 'newMessage',
              payload: messageCreated,
            };

            broadcastToRoom(roomId, messageToBroadcast);
          } else {
            broadcastErrorToUser(roomId, ws);
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error('Internal server error', error);
    }
  });

  ws.on('close', () => {
    const { roomId, userId } = clientData.get(ws);

    if (roomId) {
      leaveRoom(ws, roomId, userId);
    } else {
      console.error('Internal server error', 'Invalid roomId');
    }
  });
});

console.log('🟢 Web socket server is running');
