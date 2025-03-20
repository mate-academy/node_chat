import { Message, User } from '../models/index.js';
import { ApiError } from '../exceptions/api.error.js';

const createNewMessage = async (message, roomId, authorId) => {
  if (!message) {
    throw ApiError.badRequest('Message text is required to create new message');
  }

  if (!roomId) {
    throw ApiError.badRequest('Room ID is required to create new message');
  }

  if (!authorId) {
    throw ApiError.badRequest('Author ID is required to create new message');
  }

  const newMessage = await Message.create({ text: message, roomId, authorId });

  return Message.findByPk(newMessage.id, {
    include: [
      {
        model: User,
        as: 'author',
      },
    ],
  });
};

const findMessageById = async (messageId) => {
  if (!messageId) {
    throw ApiError.badRequest('Message ID is required to find message by ID');
  }

  const message = await Message.findByPk(+messageId);

  if (!message) {
    throw ApiError.notFound(`Message with such ID (${messageId}) is not found`);
  }

  return message;
};

const normalizeMessage = (message) => {
  const { id, author, text, createdAt } = message;

  return {
    messageId: id,
    authorName: author.username,
    text,
    normalizedTime: new Date(createdAt).toLocaleString('ru-RU'),
  };
};

export const messageService = {
  createNewMessage,
  findMessageById,
  normalizeMessage,
};
