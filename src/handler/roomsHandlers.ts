import { IncomingMessage, ServerResponse } from 'node:http';

import { roomStore } from '../store/roomStore.js';
import { readJsonBody } from '../utils/readJsonBody.js';
import { sendJson } from '../utils/utils.js';

type RoomPayload = {
  name?: unknown;
};

type MessagePayload = {
  author?: unknown;
  text?: unknown;
};

function parseRoomName(payload: RoomPayload | null) {
  if (!payload || typeof payload.name !== 'string') {
    return null;
  }

  const roomName = payload.name.trim();

  if (!roomName) {
    return null;
  }

  return roomName;
}

function parseMessagePayload(payload: MessagePayload | null) {
  if (!payload) {
    return null;
  }

  if (typeof payload.author !== 'string' || typeof payload.text !== 'string') {
    return null;
  }

  const author = payload.author.trim();
  const text = payload.text.trim();

  if (!author || !text) {
    return null;
  }

  return { author, text };
}

function sendInvalidBody(
  request: IncomingMessage,
  response: ServerResponse,
  message = 'Room name is required',
) {
  sendJson(request, response, 400, { error: message });
}

export function getRoomsHandler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  sendJson(request, response, 200, {
    rooms: roomStore.getAllRooms(),
  });
}

export function getRoomByIdHandler(
  request: IncomingMessage,
  response: ServerResponse,
  roomId: string,
) {
  const room = roomStore.getRoomById(roomId);

  if (!room) {
    sendJson(request, response, 404, { error: 'Room not found' });

    return;
  }

  sendJson(request, response, 200, { room });
}

export async function createRoomHandler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  try {
    const payload = await readJsonBody<RoomPayload>(request);
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
}

export async function updateRoomHandler(
  request: IncomingMessage,
  response: ServerResponse,
  roomId: string,
) {
  const currentRoom = roomStore.getRoomById(roomId);

  if (!currentRoom) {
    sendJson(request, response, 404, { error: 'Room not found' });

    return;
  }

  try {
    const payload = await readJsonBody<RoomPayload>(request);
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
}

export function deleteRoomHandler(
  request: IncomingMessage,
  response: ServerResponse,
  roomId: string,
) {
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
}

export async function addMessageToRoomHandler(
  request: IncomingMessage,
  response: ServerResponse,
  roomId: string,
) {
  const currentRoom = roomStore.getRoomById(roomId);

  if (!currentRoom) {
    sendJson(request, response, 404, { error: 'Room not found' });

    return;
  }

  try {
    const payload = await readJsonBody<MessagePayload>(request);
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

    if (!message) {
      sendJson(request, response, 404, { error: 'Room not found' });

      return;
    }

    sendJson(request, response, 201, { message });
  } catch {
    sendInvalidBody(request, response, 'Invalid JSON body');
  }
}
