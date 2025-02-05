// const { ApiError } = require('../exeptions/api.error.js');
const { Message } = require('../models/message.model.js');

const getMessages = async () => {
  const messages = await Message.findAll();

  return messages;
};

const getMessagesByRoom = async (roomId) => {
  const messages = await Message.findAll({ where: { roomId } });

  return messages;
};

const addMessage = async (userId, roomId, text) => {
  const newMessage = await Message.create({
    userId,
    roomId,
    text,
  });

  return newMessage;
};

module.exports = {
  messageService: {
    getMessages,
    getMessagesByRoom,
    addMessage,
  },
};
