const { ApiError } = require('../exceptions/apiError');
const { Message } = require('../models/Message');
const { join } = require('./room.service');

const createMessage = async (author, text, roomId) => {
  if (!author) {
    throw ApiError.unauthorized();
  }

  if (!text) {
    throw ApiError.badRequest('Message is required');
  }

  const existRoom = await join(roomId);

  if (!existRoom) {
    throw ApiError.notFound();
  }

  const message = await Message.create({ author, text, roomId });

  return message;
};

const getMessages = async (id) => {
  const messages = await Message.findAll({ where: { id } });

  return messages;
};

module.exports = { createMessage, getMessages };
