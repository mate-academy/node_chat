import { Message } from '../models/index.js';

const getMessagesByRoom = async (roomId) => {
  const messages = await Message.findAll({ where: { roomId: +roomId } });

  return messages;
};

const createMessage = async (userId, login, roomId, text) => {
  const newMessage = await Message.create({
    authorId: userId,
    authorName: login,
    roomId,
    text,
  });

  return newMessage;
};

export const messageService = {
  getMessagesByRoom,
  createMessage,
};
