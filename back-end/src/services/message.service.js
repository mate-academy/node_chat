import { Message, User } from '../models/index.js';

const getMessages = async (RoomId) => {
  const messages = await Message.findAll({
    where: {
      RoomId,
    },
    include: {
      model: User,
      attributes: ['id', 'name'],
    },
  });

  return messages;
};

const sendMessage = async ({ content, userId, roomId }) => {
  const message = await Message.create({
    content,
    UserId: userId,
    RoomId: roomId,
  });

  return message;
};

export const messageService = {
  getMessages,
  sendMessage,
};
