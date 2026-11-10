const express = require('express');
const {
  getMessageForChat,
  createMessage,
} = require('../controllers/messageController');

const messageRouter = express.Router();

messageRouter.get('/:chatId', getMessageForChat);

messageRouter.post('/:chatId', createMessage);

module.exports = { messageRouter };
