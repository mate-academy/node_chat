import { Message } from '../modules/Message.js';

async function getMessages(roomId) {
  return Message.findAll({
    where: { roomId: roomId || null },
  });
}

async function addMessage(username, text, roomId, userId) {
  const message = await Message.create({
    username,
    time: new Date().toISOString(),
    text,
    roomId: roomId || null,
    userId,
  });

  return message;
}

export const messageService = {
  getMessages,
  addMessage,
};
