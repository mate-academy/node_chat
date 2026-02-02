'use strict';

const { Message } = require('./../models/Message.model.js')

const getAll = () => {
  return Message.findAll();
}
const createMessage = ({ roomId, authorName, text, userId }) => {
  if (!roomId || !authorName || !text || !userId) {
    throw new Error('data is required');
  }

  const message = {
    text,
    authorName,
    userId,
    roomId,
  }

  return Message.create(message);
};

module.exports = {
  getAll,
  createMessage,
}
