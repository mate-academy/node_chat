'use strict';

const { ApiError } = require('../exceptions/api.error');
const { Chats } = require('../models/chats');
const { getMessages } = require('../services/messages.service');
const { getChats } = require('../services/chat.service');

const getChatById = async(req, res) => {
  const { chatId } = req.params;
  const { limit, offset } = req.query;

  const isChatExist = await Chats.findByPk(chatId);

  if (!isChatExist) {
    throw ApiError.badRequest('Chat does not exist');
  }

  const messages = await getMessages(chatId, limit, offset);

  res.send(messages);
};

const getAllChats = async(req, res) => {
  const chats = await getChats();

  if (!chats) {
    throw ApiError.badRequest('No chats');
  };

  res.send(chats);
};

const createChat = async(req, res) => {
  const { name, chatAuthor } = req.body;

  if (!chatAuthor || !name) {
    throw ApiError.badRequest('No chatAuthor or chatName');
  }

  Chats.create({
    name,
    chatAuthor,
  });

  res.sendStatus(200);
};

module.exports = {
  getChatById,
  createChat,
  getAllChats,
};
