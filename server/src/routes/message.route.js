const express = require('express');
const messageController = require('../controllers/message.controller.js');
const catchError = require('../middlewares/catchError.js');

const messageRoute = express.Router();

messageRoute.post('/', catchError(messageController.createMessage));
messageRoute.post('/unread', catchError(messageController.getUnreadMessages));
messageRoute.get('/:chatId', catchError(messageController.getMessages));
messageRoute.patch('/readAll', catchError(messageController.readAll));

messageRoute.patch(
  '/:chatId/:userId',
  catchError(messageController.setReadStatus),
);

module.exports = messageRoute;
