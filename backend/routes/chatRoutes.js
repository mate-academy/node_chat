const express = require('express');
const {chatController: chat } = require('../controllers/chat.controller');
const { middlewareErrorHandler } = require('../middleware/middlewareErrorHandler.js');
const checkIdRoom = require('../middleware/chedkIdRoom');
const checkPostMessageData = require('../middleware/checkPostMessageData');

const chatRoutes = new express.Router();

chatRoutes.get(
  '/:idRoom',
  middlewareErrorHandler(checkIdRoom),
  middlewareErrorHandler(chat.getChat));

chatRoutes.post(
  '/:idRoom',
  middlewareErrorHandler(checkIdRoom),
  middlewareErrorHandler(checkPostMessageData),
  middlewareErrorHandler(chat.postMessage)
);

module.exports = chatRoutes;
