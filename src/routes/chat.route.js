'use strict';

const express = require('express');
const { catchError } = require('../utils/catchError');
const chatController = require('../controllers/chat.controller');

const chatRouter = new express.Router();

chatRouter.get('/:chatId', catchError(chatController.getChatById));
chatRouter.get('/', catchError(chatController.getAllChats));

module.exports = {
  chatRouter,
};
