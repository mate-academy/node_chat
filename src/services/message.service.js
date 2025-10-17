import { Message } from '../models/message.js';
import { User } from '../models/user.model.js';

const getAllMessagesInRoom = async (roomId) => {
  const messages = await Message.findAll({
    where: { roomId },
    include: [
      {
        model: User,
        attributes: ['name'],
      },
    ],
    order: [['createdAt', 'ASC']],
  });

  return messages.map((msg) => ({
    author: msg.User?.name || 'Unknown',
    time: msg.createdAt,
    text: msg.text,
  }));
};

const createMessageInRoom = async (text, userId, roomId) => {
  const newMessage = await Message.create({ text, userId, roomId });

  // Підтягуємо користувача, щоб сформувати коректний author
  const user = await User.findByPk(userId);

  return {
    author: user?.name || 'Unknown',
    time: newMessage.createdAt,
    text: newMessage.text,
  };
};

export const messageService = {
  getAllMessagesInRoom,
  createMessageInRoom,
};
