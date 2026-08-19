'use strict';

const {
  addMessageToRoomHandler,
  createRoomHandler,
  deleteRoomHandler,
  getRoomByIdHandler,
  getRoomsHandler,
  updateRoomHandler,
} = require('./handler/roomsHandlers');
const { sendJson } = require('./utils/utils');

const ROOM_MESSAGES_PATHNAME_REGEXP = /^\/rooms\/([^/]+)\/messages$/;
const ROOM_ID_PATHNAME_REGEXP = /^\/rooms\/([^/]+)$/;

const decodePathPart = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

const router = async (method, pathname, request, response) => {
  if (method === 'GET' && pathname === '/health') {
    sendJson(request, response, 200, {
      message: 'Chat server is running',
      status: 'ok',
    });

    return true;
  }

  if (method === 'GET' && pathname === '/rooms') {
    getRoomsHandler(request, response);

    return true;
  }

  if (method === 'POST' && pathname === '/rooms') {
    await createRoomHandler(request, response);

    return true;
  }

  const roomMessagesMatch = pathname.match(ROOM_MESSAGES_PATHNAME_REGEXP);

  if (roomMessagesMatch && method === 'POST') {
    const messageRoomId = decodePathPart(roomMessagesMatch[1]);

    if (messageRoomId === null) {
      sendJson(request, response, 400, { error: 'Invalid room id' });
    } else {
      await addMessageToRoomHandler(request, response, messageRoomId);
    }

    return true;
  }

  const roomMatch = pathname.match(ROOM_ID_PATHNAME_REGEXP);

  if (!roomMatch) {
    return false;
  }

  const roomId = decodePathPart(roomMatch[1]);

  if (roomId === null) {
    sendJson(request, response, 400, { error: 'Invalid room id' });

    return true;
  }

  if (method === 'GET') {
    getRoomByIdHandler(request, response, roomId);

    return true;
  }

  if (method === 'PATCH') {
    await updateRoomHandler(request, response, roomId);

    return true;
  }

  if (method === 'DELETE') {
    deleteRoomHandler(request, response, roomId);

    return true;
  }

  return false;
};

exports.router = router;
