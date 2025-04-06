'use strict';

const express = require('express');
const messagesController = require('../controllers/messages.controller');

const messagesRouter = new express.Router();

messagesRouter.post('/messages', messagesController.sendMessage);
messagesRouter.get('/messages/:chatId', messagesController.getMessages);
messagesRouter.get('/history/:chatId', messagesController.getMessageHistory);

module.exports = messagesRouter;
