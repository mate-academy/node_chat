'use strict';

const { roomStore } = require('../store/roomStore');
const { readJsonBody } = require('../utils/readJsonBody');
const { sendJson } = require('../utils/utils');

const parseRoomName = (payload) => {
  if (!payload || typeof payload.name !== 'string') {
    return null;
  }

  const roomName = payload.name.trim();

  return roomName || null;
};

const parseMessagePayload = (payload) => {
  if (
    !payload ||
    typeof payload.author !== 'string' ||
    typeof payload.text !== 'string'
  ) {
    return null;
  }

  const author = payload.author.trim();
  const text = payload.text.trim();

  if (!author || !text) {
    return null;
  }

  return { author, text };
};

const sendInvalidBody = (
  request,
  response,
  message = 'Room name is required',
) => {
  sendJson(request, response, 400, { error: message });
};

const getRoomsHandler = (request, response) => {
  sendJson(request, response, 200, {
    rooms: roomStore.getAllRooms(),
  });
};

const getRoomByIdHandler = (request, response, roomId) => {
  const room = roomStore.getRoomById(roomId);

  if (!room) {
    sendJson(request, response, 404, { error: 'Room not found' });

    return;
  }

  sendJson(request, response, 200, { room });
};

const createRoomHandler = async (request, response) => {
  try {
    const payload = await readJsonBody(request);
    const roomName = parseRoomName(payload);

    if (!roomName) {
      sendInvalidBody(request, response);

      return;
    }

    if (roomStore.hasRoomWithName(roomName)) {
      sendJson(request, response, 409, {
        error: 'Room with this name already exists',
      });

      return;
    }

    const room = roomStore.createRoom(roomName);

    sendJson(request, response, 201, { room });
  } catch {
    sendInvalidBody(request, response, 'Invalid JSON body');
  }
};

const updateRoomHandler = async (request, response, roomId) => {
  if (!roomStore.getRoomById(roomId)) {
    sendJson(request, response, 404, { error: 'Room not found' });

    return;
  }

  try {
    const payload = await readJsonBody(request);
    const roomName = parseRoomName(payload);

    if (!roomName) {
      sendInvalidBody(request, response);

      return;
    }

    if (roomStore.hasRoomWithName(roomName, roomId)) {
      sendJson(request, response, 409, {
        error: 'Room with this name already exists',
      });

      return;
    }

    const room = roomStore.updateRoom(roomId, roomName);

    sendJson(request, response, 200, { room });
  } catch {
    sendInvalidBody(request, response, 'Invalid JSON body');
  }
};

const deleteRoomHandler = (request, response, roomId) => {
  if (roomId === roomStore.GENERAL_ROOM_ID) {
    sendJson(request, response, 400, {
      error: 'General room cannot be deleted',
    });

    return;
  }

  const deletedRoom = roomStore.deleteRoom(roomId);

  if (!deletedRoom) {
    sendJson(request, response, 404, { error: 'Room not found' });

    return;
  }

  sendJson(request, response, 200, {
    deletedRoom,
    fallbackRoomId: roomStore.GENERAL_ROOM_ID,
  });
};

const addMessageToRoomHandler = async (request, response, roomId) => {
  if (!roomStore.getRoomById(roomId)) {
    sendJson(request, response, 404, { error: 'Room not found' });

    return;
  }

  try {
    const payload = await readJsonBody(request);
    const messagePayload = parseMessagePayload(payload);

    if (!messagePayload) {
      sendInvalidBody(request, response, 'Author and text are required');

      return;
    }

    const message = roomStore.addMessageToRoom(
      roomId,
      messagePayload.author,
      messagePayload.text,
    );

    sendJson(request, response, 201, { message });
  } catch {
    sendInvalidBody(request, response, 'Invalid JSON body');
  }
};

exports.getRoomsHandler = getRoomsHandler;
exports.getRoomByIdHandler = getRoomByIdHandler;
exports.createRoomHandler = createRoomHandler;
exports.updateRoomHandler = updateRoomHandler;
exports.deleteRoomHandler = deleteRoomHandler;
exports.addMessageToRoomHandler = addMessageToRoomHandler;
