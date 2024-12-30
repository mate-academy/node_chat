const { Message } = require('../models/Message.js');

const createMessage = async (text, userName, userId, roomId) => {
  const message = await Message.create({
    userName,
    userId,
    roomId,
    text,
  });

  return message;
};

const getMessageById = async (id) => {
  const message = await Message.findByPk(id);

  return message;
};

const getMessagesByRoom = async (roomId) => {
  const messages = await Message.findAll({
    where: { roomId },
    order: [['createdAt', 'ASC']],
  });

  return messages;
};

module.exports = {
  messageService: { createMessage, getMessageById, getMessagesByRoom },
};
