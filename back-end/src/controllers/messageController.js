const emitter = require('../utils/eventEmiter');
const { v4: uuidv4 } = require('uuid');
const { getChatById } = require('../services/chat.service');

const getMessageForChat = (req, res) => {
  const { chatId } = req.params;

  const chat = getChatById(chatId);

  if (!chat) {
    return res.status(404).json({
      message: 'Chat not found',
    });
  }

  res.status(200).json(chat.messages);
};

const createMessage = (req, res) => {
  const { text, author } = req.body;
  const { chatId } = req.params;

  const chat = getChatById(chatId);

  if (!chat) {
    return res.status(404).json({
      message: 'Chat not found',
    });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({
      message: 'Message cannot be empty',
    });
  }

  if (typeof author !== 'string' || !chat.users.includes(author)) {
    return res.status(403).json({
      message: 'You are not a member of this chat',
    });
  }

  const message = {
    id: uuidv4(),
    text,
    time: new Date(),
    author,
    chatId,
  };

  chat.messages.push(message);

  emitter.emit('message', message);

  res.status(201).json(message);
};

module.exports = {
  getMessageForChat,
  createMessage,
};
