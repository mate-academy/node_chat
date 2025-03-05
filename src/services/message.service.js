import { Message } from '../models/Message.js';

export const createMessage = (text, userId, roomId) => {
  return Message.create({ text, userId, roomId });
};

export const getMessagesInRoom = (roomId) => {
  return Message.findAll({ where: { roomId } });
};
