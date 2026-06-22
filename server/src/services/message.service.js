import { Message, User } from '../models/index.js';

const getRoomMessages = async (roomId) => {
  return Message.findAll({
    where: { roomId },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['username'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });
};

const createMessage = async (text, userId, roomId) => {
  const newMessage = await Message.create({ text, userId, roomId });

  return Message.findByPk(newMessage.id, {
    include: [{ model: User, as: 'author', attributes: ['username'] }],
  });
};

export const messageService = {
  getRoomMessages,
  createMessage,
};
