'use strict';

const { ApiError } = require('../exceptions/api.error');
const { Chats } = require('../models/chats');

const getChat = async(id) => {
  if (!id) {
    throw ApiError.badRequest('Invalid id');
  }

  try {
    const chat = await Chats.findByPk(id);

    return chat;
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
};

const getChats = async() => {
  const chats = await Chats.findAll({
    order: [['createdAt', 'DESC']],
  });

  return chats;
};

const createChat = async(data) => {
  const { chatAuthor, name } = data;
  const correctRequest = chatAuthor && name;

  if (!correctRequest) {
    throw ApiError.badRequest('Not enough information to create chat');
  }

  const newChat = await Chats.create({
    name,
    chatAuthor,
  });

  return newChat;
};

const deleteChat = async({ chatAuthor, chatId }) => {
  const chat = await getChat(chatId);

  if (!chat) {
    throw ApiError.badRequest('Chat does not exist');
  }

  if (chatAuthor !== chat.chatAuthor) {
    throw ApiError.badRequest('Chat can delete only his author');
  }

  await Chats.destroy({ where: { id: chatId } });
};

const renameChat = async({ chatAuthor, chatId, newTitle }) => {
  const chat = await getChat(chatId);

  if (!chat) {
    throw ApiError.badRequest('Chat does not exist');
  }

  if (chatAuthor !== chat.chatAuthor) {
    throw ApiError.badRequest('Chat can rename only his author');
  }

  await Chats.update({ name: newTitle }, {
    where: { id: chatId },
  });

  const renamedChat = await getChat(chatId);

  return renamedChat;
};

module.exports = {
  createChat,
  getChats,
  deleteChat,
  renameChat,
};
