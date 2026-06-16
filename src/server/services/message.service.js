import { Message } from '../models/message.js';

function createMessage({ roomId, text, userName }) {
  return Message.create({
    text,
    roomId,
    author: userName,
  });
}

function getMessages(roomId) {
  return Message.findAll({
    where: { roomId },
    order: [['createdAt', 'ASC']],
  });
}

export const messageService = {
  createMessage,
  getMessages,
};
