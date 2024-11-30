import { ApiError } from '../exceptions/ApiError.js';
import { Message } from '../models/messages.js';

const createMessage = async (author, text, roomId) => {
  if (!author) {
    throw ApiError.unauthorized();
  }

  if (!text) {
    throw ApiError.badRequest('Message is required');
  }

  const room = await join(roomId);

  if (!room) {
    throw ApiError.notFound();
  }

  return await Message.create({ author, text, roomId })
};

const getMessages = async (roomId) => {
  return await Message.findAll({ where: { roomId } })
}

export const messageService = {
  getMessages,
  createMessage,
}
