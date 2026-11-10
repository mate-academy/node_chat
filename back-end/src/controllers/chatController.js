const { v4: uuidv4 } = require('uuid');

const {
  getChatById,
  getChats,
  addChat,
  updateChat,
  deleteChat,
} = require('../services/chat.service');

function createChat(req, res) {
  const { name, author } = req.body;

  if (!name || !author) {
    return res.status(400).json({
      message: 'Name and author are required',
    });
  }

  const newChat = {
    id: uuidv4(),
    name,
    author,
    users: [author],
    messages: [],
  };

  addChat(newChat);

  return res.status(201).json(newChat);
}

function getAllChats(req, res) {
  return res.status(200).json(getChats());
}

function getChat(req, res) {
  const chat = getChatById(req.params.chatId);

  if (!chat) {
    return res.status(404).json({
      message: 'Chat not found',
    });
  }

  return res.status(200).json(chat);
}

function editChat(req, res) {
  const { name } = req.body;

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      message: 'Chat name is required',
    });
  }

  const chat = updateChat(req.params.chatId, name.trim());

  if (!chat) {
    return res.status(404).json({
      message: 'Chat not found',
    });
  }

  return res.status(200).json(chat);
}

function removeChat(req, res) {
  const chat = deleteChat(req.params.chatId);

  if (!chat) {
    return res.status(404).json({
      message: 'Chat not found',
    });
  }

  return res.status(200).json(chat);
}

function joinChat(req, res) {
  const { chatId } = req.params;
  const { user } = req.body;

  if (!user || typeof user !== 'string' || !user.trim()) {
    return res.status(400).json({
      message: 'Username is required',
    });
  }

  const chat = getChatById(chatId);

  if (!chat) {
    return res.status(404).json({
      message: 'Chat not found',
    });
  }

  if (chat.users.includes(user)) {
    return res.status(409).json({
      message: 'User already joined',
    });
  }

  chat.users.push(user);

  return res.status(200).json(chat);
}

module.exports = {
  createChat,
  getAllChats,
  getChat,
  editChat,
  removeChat,
  joinChat,
};
