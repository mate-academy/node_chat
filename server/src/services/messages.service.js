import { Message } from '../models/message.js';

const listMessages = async (roomId) => {
  return Message.findAll({
    where: { roomId },
    order: [
      ['createdAt', 'ASC'],
      ['id', 'ASC'],
    ],
  });
};

const createMessage = async (roomId, author, text) => {
  return Message.create({
    roomId,
    author,
    text,
  });
};

const updateMessage = async (roomId, messageId, text) => {
  const message = await Message.findOne({
    where: {
      id: messageId,
      roomId,
    },
  });

  if (!message) {
    return null;
  }

  await message.update({ text });

  return message;
};

const deleteMessage = async (roomId, messageId) => {
  const message = await Message.findOne({
    where: {
      id: messageId,
      roomId,
    },
  });

  if (!message) {
    return null;
  }

  await message.destroy();

  return message;
};

export const messagesService = {
  listMessages,
  createMessage,
  updateMessage,
  deleteMessage,
};
