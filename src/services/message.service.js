import { Message } from '../models/message.model.js';

const getAllMessagesInRoom = (roomId) => {
  return Message.findAll({ where: { roomId } });
};

const createMessageInRoom = (text, userId, roomId) => {
  return Message.create({ text, userId, roomId });
};

export const messageService = {
  getAllMessagesInRoom,
  createMessageInRoom,
};
