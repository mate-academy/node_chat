const { catchError } = require('../utils/catchError');
const express = require('express');
const messageController = require('../controllers/message.controller');

const messageRouter = new express.Router();

messageRouter.post('/create', catchError(messageController.create));

module.exports = {
  messageRouter,
};
