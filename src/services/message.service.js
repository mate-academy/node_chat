import { Message } from '../models/message.js';
import { User } from '../models/user.js';

const getAllMessagesInRoom = async (roomId) => {
  if (!roomId) {
    throw new Error('roomId is required');
  }

  const messages = await Message.findAll({
    where: { roomId },
    include: [{ model: User, attributes: ['name'] }],
    order: [['createdAt', 'ASC']],
  });

  return messages.map((msg) => ({
    author: msg.user?.name || 'Unknown',
    time: msg.createdAt,
    text: msg.text,
    roomId: msg.roomId,
  }));
};

const createMessageInRoom = async (text, userId, roomId) => {
  if (!text || !userId || !roomId) {
    throw new Error('Missing required fields');
  }

  const newMessage = await Message.create({ text, userId, roomId });

  const messageWithUser = await Message.findByPk(newMessage.id, {
    include: [{ model: User, attributes: ['name'] }],
  });

  return {
    author: messageWithUser.user?.name || 'Unknown',
    time: messageWithUser.createdAt,
    text: messageWithUser.text,
    roomId: messageWithUser.roomId,
  };
};

export const messageService = {
  getAllMessagesInRoom,
  createMessageInRoom,
};
