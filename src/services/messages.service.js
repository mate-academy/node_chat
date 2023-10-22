'use strict';

const { ApiError } = require('../exceptions/api.error');
const { Messages } = require('../models/messages');

async function getMessages(chatId, limit = 10, offset = 0) {
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

const messagesWS = async(wss, message) => {
  const { author, text, chatId } = JSON.parse(message);

  const newMessage = await Messages.create({
    author,
    text: text.toString(),
    chatId: +chatId,
  });

  for (const client of wss.clients) {
    client.send(JSON.stringify(newMessage));
  }
};

module.exports = {
  getMessages,
  messagesWS,
};
