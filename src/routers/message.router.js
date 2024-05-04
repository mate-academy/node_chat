'use strict';

const express = require('express');
const messageController = require('../controllers/message.controller');
const { catchError } = require('../middlewares/catchError');

const messageRouter = express.Router();

messageRouter.get(
  '/direct/:directId',
  catchError(messageController.getDirectMessages),
);

messageRouter.get(
  '/room/:roomId',
  catchError(messageController.getRoomMessages),
);
messageRouter.patch('/:messageId', catchError(messageController.edit));
messageRouter.delete('/:messageId', catchError(messageController.remove));

module.exports = {
  messageRouter,
};
