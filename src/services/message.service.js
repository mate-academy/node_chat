import { Message } from '../models/message.model.js';

const createMessage = async (author, text, roomId) => {
  const newMessage = await Message.create({
    author,
    time: new Date().toISOString(),
    text,
    roomId,
  });

  return newMessage;
};

const findAllMessagesByRoomId = (roomId) => {
  const res = Message.findAll({ where: { roomId } });

  return res;
};

export const messageService = {
  createMessage,
  findAllMessagesByRoomId,
};
