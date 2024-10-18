const { catchError } = require('../utils/catchError');
const express = require('express');
const messageController = require('../controllers/message.controller');

const messageRouter = new express.Router();

messageRouter.post('/create', catchError(messageController.create));
messageRouter.get('/get/:id', catchError(messageController.getByRoomId));

module.exports = {
  messageRouter,
};
