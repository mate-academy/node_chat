const { Message } = require('../models/message.model.js');

const create = ({ userId, roomId, text }) => {
  return Message.create({ userId, roomId, text });
};

const getAllMessages = (roomId) => {
  return Message.findAll({ where: { roomId } });
};

module.exports = { messageService: { create, getAllMessages } };
