const chatController = require('../controllers/chat.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const catchError = require('../service/catchError.service');
const express = require('express');

const chatRouter = express.Router();

chatRouter.post(
  '/create',
  authMiddleware,
  catchError(chatController.createChat),
);

chatRouter.post(
  '/join/:chatId',
  authMiddleware,
  catchError(chatController.joinChat),
);

chatRouter.get(
  '/discover',
  authMiddleware,
  catchError(chatController.getDiscoverableChats),
);

chatRouter.get(
  '/my-chats',
  authMiddleware,
  catchError(chatController.getChatsForUser),
);

chatRouter.get(
  '/messages/:chatId',
  authMiddleware,
  catchError(chatController.getMessagesForChat),
);

chatRouter.patch(
  '/rename/:chatId',
  authMiddleware,
  catchError(chatController.renameChat),
);

chatRouter.delete(
  '/delete/:chatId',
  authMiddleware,
  catchError(chatController.deleteChat),
);

module.exports = chatRouter;
