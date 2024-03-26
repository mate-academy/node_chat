'use strict';

const { Message } = require('../models/Message');

function normalize({ id, text, creatorName, createdAt }) {
  return {
    id, text, creatorName, createdAt,
  };
};

async function getAllByChat(chatId) {
  const messages = await Message.findAll({
    where: { chatId },
    attributes: { exclude: ['chatId'] }, // normalized
    order: ['createdAt'],
  });

  return messages;
}

async function create({ text, creatorName, chatId }) {
  const newMessage = await Message.create({
    text,
    creatorName,
    chatId,
  });

  return normalize(newMessage);
}

const messagesService = {
  getAllByChat,
  create,
};

module.exports = { messagesService };
