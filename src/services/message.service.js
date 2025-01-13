import { Message } from '../models/Message.model.js';
import { ApiError } from '../exeptions/api.error.js';
import { roomService } from './room.service.js';

export async function addMessage(author, text, roomId) {
  const room = await roomService.getById(roomId);
  if (!room) {
    throw ApiError.notFound(`Room with id ${roomId} not found`);
  }

  return await Message.create({
    author,
    text,
    roomId,
  });
}

export async function getMessages(roomId) {
  const room = await roomService.getById(roomId);
  if (!room) {
    throw ApiError.notFound(`Room with id ${roomId} not found`);
  }

  return await Message.findAll({
    where: { roomId },
    order: [['createdAt', 'ASC']],
  });
}

export const messageService = {
  addMessage,
  getMessages,
};
