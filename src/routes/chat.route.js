'use strict';

const express = require('express');
const { catchError } = require('../utils/catchError');
const chatController = require('../controllers/chat.controller');

const chatRouter = new express.Router();

chatRouter.get('/:chatId', catchError(chatController.get));
chatRouter.post('/', catchError(chatController.create));

module.exports = {
  chatRouter,
};
