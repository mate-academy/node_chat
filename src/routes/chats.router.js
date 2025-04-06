'use strict';

const express = require('express');
const chatsController = require('../controllers/chats.controller');

const chatsRouter = new express.Router();

chatsRouter.post('/create-chat', chatsController.createChat);
chatsRouter.delete('/delete-chat/:chatId', chatsController.deleteChat);
chatsRouter.patch('/rename-chat/:chatId', chatsController.updateChat);
chatsRouter.get('/chats', chatsController.showAllChats);

module.exports = chatsRouter;
