import { ApiError } from '../exeptions/api.error.js';
import { Message } from '../models/message.js';
import { Room } from '../models/room.js';

function normalize({ id, text, userId, roomId }) {
  return { id, text, userId, roomId };
}

async function getAllMessages(roomId) {
  return await Message.findAll({ where: { roomId } });
}

async function create(message, userId, roomId) {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw ApiError.notFound({ message: `Room with id ${roomId} is not found` });
  }

  return await Message.create({ text: message, userId, roomId });
}

export const messageService = {
  create,
  getAllMessages,
  normalize,
};
