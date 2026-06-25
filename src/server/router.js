'use strict';

const {
  readJsonBody,
  sendJson,
  sendMethodNotAllowed,
  sendNotFound,
} = require('./http');
const {
  validateMessage,
  validateRoomName,
  validateUsername,
} = require('../utils/validation');

const getRoomId = (pathname) => {
  const match = pathname.match(/^\/api\/rooms\/([a-f0-9-]+)$/);

  return match && match[1];
};

const getMessagesRoomId = (pathname) => {
  const match = pathname.match(/^\/api\/rooms\/([a-f0-9-]+)\/messages$/);

  return match && match[1];
};

const handleApi = async (req, res, pathname, store, eventBus) => {
  if (pathname === '/api/state') {
    if (req.method !== 'GET') {
      sendMethodNotAllowed(res);

      return;
    }

    sendJson(res, 200, store.getState());

    return;
  }

  if (pathname === '/api/users') {
    if (req.method !== 'POST') {
      sendMethodNotAllowed(res);

      return;
    }

    const body = await readJsonBody(req);
    const username = validateUsername(body.username);

    sendJson(res, 200, { username });

    return;
  }

  if (pathname === '/api/rooms') {
    if (req.method !== 'POST') {
      sendMethodNotAllowed(res);

      return;
    }

    const body = await readJsonBody(req);
    const room = store.createRoom(validateRoomName(body.name));

    eventBus.broadcast('rooms', store.getState());
    sendJson(res, 201, room);

    return;
  }

  const roomId = getRoomId(pathname);
  const messagesRoomId = getMessagesRoomId(pathname);

  if (roomId) {
    await handleRoom(req, res, roomId, store, eventBus);

    return;
  }

  if (messagesRoomId) {
    await handleMessages(req, res, messagesRoomId, store, eventBus);

    return;
  }

  sendNotFound(res);
};

const handleRoom = async (req, res, roomId, store, eventBus) => {
  if (req.method === 'GET') {
    const room = store.getRoom(roomId);

    if (!room) {
      sendNotFound(res);

      return;
    }

    sendJson(res, 200, room);

    return;
  }

  if (req.method === 'PATCH') {
    const body = await readJsonBody(req);
    const room = store.renameRoom(roomId, validateRoomName(body.name));

    if (!room) {
      sendNotFound(res);

      return;
    }

    eventBus.broadcast('rooms', store.getState());
    sendJson(res, 200, room);

    return;
  }

  if (req.method === 'DELETE') {
    const result = store.deleteRoom(roomId);

    if (result.error) {
      sendJson(res, result.statusCode, { error: result.error });

      return;
    }

    eventBus.broadcast('room-deleted', {
      roomId,
      state: store.getState(),
    });
    sendJson(res, 200, { roomId });

    return;
  }

  sendMethodNotAllowed(res);
};

const handleMessages = async (req, res, roomId, store, eventBus) => {
  if (req.method !== 'POST') {
    sendMethodNotAllowed(res);

    return;
  }

  const body = await readJsonBody(req);
  const message = validateMessage(body);
  const savedMessage = store.addMessage(roomId, message);

  if (!savedMessage) {
    sendNotFound(res);

    return;
  }

  eventBus.broadcast('message', {
    roomId,
    message: savedMessage,
    state: store.getState(),
  });
  sendJson(res, 201, savedMessage);
};

module.exports = { handleApi };
