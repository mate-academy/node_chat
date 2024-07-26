const express = require('express');
const { catchError } = require('../utils/catchError');
const { messageController } = require('../controller/message.controller');

const messageRouter = express.Router();

messageRouter.get('/', catchError(messageController.getAllMessage));
messageRouter.post('/', catchError(messageController.createMessage));

module.exports = {
  messageRouter,
};
