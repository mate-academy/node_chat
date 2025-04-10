import { Message } from '../models/Message.js';

export const getMessagesInRoom = (roomId) => {
  return Message.findAll({ where: { roomId } });
};

export const createMessage = (text, userId, roomId) => {
  return Message.create({ text, userId, roomId });
};
