const { Message } = require('../models/Message');

const createMessage = (text, userId, roomId) => {
  return Message.create({ text, userId, roomId });
};

const getMessagesInRoom = (roomId) => {
  return Message.findAll({ where: { roomId } });
};

module.exports = {
  createMessage,
  getMessagesInRoom,
};
