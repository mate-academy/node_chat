const express = require('express');
const messagesController = require('../controllers/messages.controller');

const messagesRouter = express.Router();

messagesRouter.post('/polling', messagesController.polling);
messagesRouter.post('/send', messagesController.sendMessage);

module.exports = { messagesRouter };
