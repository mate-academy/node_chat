const express = require('express');
const {
  getMessages,
  addMessage,
} = require('../controllers/message.controller');
const { catchError } = require('../utils/catchError');

const messageRouter = new express.Router();

messageRouter.get('/messages/:roomId', catchError(getMessages));
messageRouter.post('/messages', catchError(addMessage));

module.exports = {
  messageRouter,
};
