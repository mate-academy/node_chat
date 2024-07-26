const { Message } = require('../models/message.model');

const getAll = async () => {
  return Message.findAll();
};

const create = async (content, senderId, roomId) => {
  return Message.create({ content, roomId, senderId });
};

const messageServices = {
  create,
  getAll,
};

module.exports = {
  messageServices,
};
