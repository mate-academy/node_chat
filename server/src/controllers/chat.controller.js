const chatService = require('../services/chat.service.js');

const createChat = async (req, res) => {
  const { firstId, secondId } = req.body;

  const chat = await chatService.createChat(firstId, secondId);

  res.status(200).send(chat);
};

const findChat = async (req, res) => {
  const { firstId, secondId } = req.body;

  const chat = await chatService.findChat(firstId, secondId);

  res.status(200).send(chat);
};

const findUserChats = async (req, res) => {
  const { userId } = req.params;
  const userChats = await chatService.getUserChats(userId);

  res.send(userChats);
};

module.exports = {
  createChat,
  findUserChats,
  findChat,
};
