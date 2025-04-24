// @ts-nocheck
import { EventEmitter } from 'events';
import { ApiError } from '../exeptions/api.error.js';
import {
  createNewMessage,
  getAllMessagesByRoomId,
  normalize,
} from '../services/messages.services.js';
import { getRoomById, getRoomByName } from '../services/room.services.js';
import { getUserById } from '../services/user.services.js';
import { validateChatRoomName } from '../utils/validator.js';

const emitter = new EventEmitter();
export const getAllMessages = async (req, res) => {
  const { roomName } = req.params;

  if (!roomName) {
    throw ApiError.badRequest('Invalid entry', {
      roomName: 'Room Name is required',
    });
  }

  const roomExist = await getRoomByName(roomName);

  if (!roomExist) {
    throw ApiError.badRequest("Room doesn't exist", {
      roomId: "Room doesn't exist",
    });
  }
  const messages = await getAllMessagesByRoomId(roomExist.id);

  res.send(messages.map(normalize));
};

export const createMessage = async ({ text, userId, roomId }) => {
  const roomExist = await getRoomById(roomId);
  const userExist = await getUserById(userId);

  if (!(text && userId && roomId)) {
    throw ApiError.badRequest('Invalid entry', {
      text: 'Text is required',
      userId: 'User ID is required',
      roomId: 'Room ID is required',
    });
  }

  if (!roomExist) {
    throw ApiError.badRequest("Room doesn't exist", {
      roomId: "Room doesn't exist",
    });
  }

  if (!userExist) {
    throw ApiError.badRequest("User doesn't exist", {
      userId: "User doesn't exist",
    });
  }

  const message = await createNewMessage({ text, userId, roomId });

  return normalize(message);
};
