/* eslint-disable no-console */
const chatRepository = require('../entity/chats.repository');
const ApiError = require('../exceptions/ApiError');

async function createChat(req, res, next) {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name || name.trim().length < 3) {
    return next(
      ApiError.BadRequest('Chat name must be at least 3 characters long'),
    );
  }

  const existingChat = await chatRepository.getChatByName(name);

  if (existingChat) {
    return next(ApiError.Conflict('A chat with this name already exists.'));
  }

  const chat = await chatRepository.createChat(name);

  await chatRepository.addChatMember(userId, chat.id);

  res.status(201).json(chat);
}

async function joinChat(req, res, next) {
  const { chatId } = req.params;
  const userId = req.user.id;

  const chat = await chatRepository.getChatById(chatId);

  if (!chat) {
    return next(ApiError.NotFound('Chat not found'));
  }

  await chatRepository.addChatMember(userId, chatId);
  res.status(200).json({ message: 'Successfully joined chat' });
}

async function getDiscoverableChats(req, res, next) {
  const chats = await chatRepository.getAllChats(req.user.id);

  res.json(chats);
}

async function getChatsForUser(req, res, next) {
  const chats = await chatRepository.getChatsForUser(req.user.id);

  res.json(chats);
}

async function getMessagesForChat(req, res, next) {
  const { chatId } = req.params;
  const messages = await chatRepository.getMessagesForChat(chatId);

  res.json(messages);
}

async function renameChat(req, res, next) {
  const { newName } = req.body;
  const { chatId } = req.params;

  if (!newName || newName.trim().length < 3) {
    return next(
      ApiError.BadRequest('New chat name must be at least 3 characters long'),
    );
  }

  const chat = await chatRepository.renameChat(chatId, newName);

  console.log(chat);

  res.json(chat);
}

async function deleteChat(req, res, next) {
  const { chatId } = req.params;

  await chatRepository.deleteChat(chatId);

  res.json({ message: 'Chat deleted successfully' });
}

module.exports = {
  createChat,
  getDiscoverableChats,
  getChatsForUser,
  getMessagesForChat,
  joinChat,
  renameChat,
  deleteChat,
};
