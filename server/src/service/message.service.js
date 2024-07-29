const { v4: uuidv4 } = require('uuid');
const { Message } = require('../models/message.model');

const getLastMessageByRoomId = async (roomId) => {
  const lastMessage = await Message.findOne({
    where: { roomId },
    order: [['createdAt', 'DESC']],
    limit: 1,
  });

  return lastMessage;
};

const create = async (messageText, roomId, userId) => {
  const newMessage = await Message.create({
    id: uuidv4(),
    messageText,
    roomId,
    userId,
  });

  return newMessage;
};

const getAll = async () => {
  const messages = await Message.findAll();

  return messages;
};

const messageService = {
  create,
  getAll,
  getLastMessageByRoomId,
};

module.exports = {
  messageService,
};
