'use strict';

const { WebSocketServer, WebSocket } = require('ws');
const {
  ChatError,
  listRoomsForUser,
  createRoomForUser,
  renameRoomForUser,
  deleteRoomForUser,
  joinRoomForUser,
  leaveRoomForUser,
  listMessagesForRoom,
  createMessageForRoom,
} = require('../services/chatService');

function getUsernameFromRequest(request) {
  const url = new URL(request.url, 'http://localhost');

  return String(url.searchParams.get('username') || '').trim();
}

function sendJson(socket, message) {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify(message));
}

function sendResponse(socket, requestId, data) {
  sendJson(socket, {
    type: 'response',
    requestId,
    ok: true,
    data,
  });
}

function sendError(socket, requestId, message) {
  sendJson(socket, {
    type: 'response',
    requestId,
    ok: false,
    message,
  });
}

async function sendRoomsToClient(socket) {
  if (!socket.username) {
    return;
  }

  const rooms = await listRoomsForUser(socket.username);

  sendJson(socket, {
    type: 'rooms:update',
    data: rooms,
  });
}

function createChatWebSocketServer(server) {
  // clients variable to track all connected clients
  const clients = new Set();
  const wss = new WebSocketServer({
    path: '/ws',
    server,
  });

  // we use this to trigger room list updates for all clients
  // for example when a room is created, deleted, or renamed
  async function broadcastRoomLists() {
    await Promise.all([...clients].map((client) => sendRoomsToClient(client)));
  }

  function broadcastToAll(message) {
    clients.forEach((client) => sendJson(client, message));
  }

  // we use this to broadcast messages to all clients in a specific room
  function broadcastToRoom(roomName, message) {
    clients.forEach((client) => {
      if (client.activeRoomName === roomName) {
        sendJson(client, message);
      }
    });
  }

  async function handleRequest(socket, request) {
    const payload = request.payload || {};

    switch (request.type) {
      case 'rooms:list': {
        const rooms = await listRoomsForUser(socket.username);

        sendResponse(socket, request.requestId, rooms);
        break;
      }

      case 'rooms:create': {
        const room = await createRoomForUser(payload.name, socket.username);

        sendResponse(socket, request.requestId, room);
        await broadcastRoomLists();
        break;
      }

      case 'rooms:rename': {
        const result = await renameRoomForUser(
          payload.name,
          payload.nextName,
          socket.username,
        );

        clients.forEach((client) => {
          if (client.activeRoomName === result.oldName) {
            client.activeRoomName = result.room.name;
          }
        });

        sendResponse(socket, request.requestId, result.room);

        broadcastToAll({
          type: 'room:renamed',
          data: {
            oldName: result.oldName,
            room: result.room,
          },
        });
        await broadcastRoomLists();
        break;
      }

      case 'rooms:delete': {
        const deletedRoom = await deleteRoomForUser(
          payload.name,
          socket.username,
        );

        clients.forEach((client) => {
          if (client.activeRoomName === deletedRoom.name) {
            client.activeRoomName = '';
          }
        });

        sendResponse(socket, request.requestId, null);

        broadcastToAll({
          type: 'room:deleted',
          data: deletedRoom,
        });
        await broadcastRoomLists();
        break;
      }

      case 'rooms:join': {
        const room = await joinRoomForUser(payload.name, socket.username);

        socket.activeRoomName = room.name;
        sendResponse(socket, request.requestId, room);
        await broadcastRoomLists();
        break;
      }

      case 'rooms:leave': {
        const room = await leaveRoomForUser(payload.name, socket.username);

        if (socket.activeRoomName === room.name) {
          socket.activeRoomName = '';
        }

        sendResponse(socket, request.requestId, room);
        await broadcastRoomLists();
        break;
      }

      case 'messages:list': {
        const result = await listMessagesForRoom(payload.roomName);

        socket.activeRoomName = result.roomName;
        sendResponse(socket, request.requestId, result.messages);
        break;
      }

      case 'messages:create': {
        const result = await createMessageForRoom(
          payload.roomName,
          socket.username,
          payload.body,
        );

        sendResponse(socket, request.requestId, result.message);

        broadcastToRoom(result.roomName, {
          type: 'messages:created',
          data: result,
        });
        await broadcastRoomLists();
        break;
      }

      default:
        throw new ChatError(400, 'Unknown chat action.');
    }
  }

  wss.on('connection', (socket, request) => {
    socket.username = getUsernameFromRequest(request);
    socket.activeRoomName = '';
    clients.add(socket);

    // eslint-disable-next-line no-console
    console.log(
      `Client connected: ${socket.username} | Total clients: ${clients.size}`,
    );

    socket.on('message', async (rawMessage) => {
      let requestMessage;

      try {
        requestMessage = JSON.parse(rawMessage.toString());

        if (!requestMessage.requestId) {
          return;
        }

        await handleRequest(socket, requestMessage);
      } catch (error) {
        const message =
          error instanceof ChatError ? error.message : 'Internal server error.';

        if (!(error instanceof ChatError)) {
          // eslint-disable-next-line no-console
          console.error(error);
        }

        sendError(socket, requestMessage?.requestId, message);
      }
    });

    socket.on('close', () => {
      clients.delete(socket);

      // eslint-disable-next-line no-console
      console.log(
        `Client disconnected: ${socket.username} | Total clients: ${clients.size}`,
      );
    });
  });

  return wss;
}

module.exports = {
  createChatWebSocketServer,
};
