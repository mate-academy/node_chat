import { Message } from '../models/Message.model.js';
import { ChatUser } from '../models/ChatUser.model.js';

const findMessagesByRoomId = async (roomId) => {
  return Message.findAll({
    where: { roomId },
  });
};

const deleteMessagesByRoomId = async (roomId) => {
  return Message.destroy({
    where: { roomId },
  });
};

const findUserById = async (userId) => {
  return ChatUser.findOne({
    where: { id: userId },
    attributes: ['username'],
  });
};

const findOrCreateUserByName = async (userName) => {
  let user = await ChatUser.findOne({
    where: { username: userName },
  });

  if (!user) {
    user = await ChatUser.create({
      username: userName,
    });
  }

  return user;
};

const createMessage = async (roomId, userId, text) => {
  return Message.create({
    userId,
    roomId,
    text,
  });
};

export const messageService = {
  findMessagesByRoomId,
  deleteMessagesByRoomId,
  findUserById,
  findOrCreateUserByName,
  createMessage,
};
