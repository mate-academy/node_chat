'use strict';

const { ApiError } = require('../exceptions/api.error');
const { Messages } = require('../models/messages');

async function getMessages(chatId, limit = 11, offset = 0) {
  const messages = await Messages.findAll({
    where: { chatId },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  if (!messages) {
    throw ApiError.notFound();
  }

  return messages;
}

async function createMessage(data) {
  const { chatId, author, text } = data;

  const correctRequest = chatId && author && text;

  if (!correctRequest) {
    throw ApiError.badRequest('Not enough information to create message');
  }

  const newMessage = await Messages.create({
    author,
    text: text.toString(),
    chatId,
  });

  return newMessage;
}

module.exports = {
  getMessages,
  createMessage,
};
