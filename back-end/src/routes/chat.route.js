const express = require('express');

const {
  createChat,
  getAllChats,
  getChat,
  editChat,
  removeChat,
  joinChat,
} = require('../controllers/chatController');

const chatRouter = express.Router();

chatRouter.post('/', createChat);
chatRouter.get('/', getAllChats);
chatRouter.get('/:chatId', getChat);
chatRouter.patch('/:chatId', editChat);
chatRouter.delete('/:chatId', removeChat);
chatRouter.post('/:chatId/join', joinChat);

module.exports = { chatRouter };
