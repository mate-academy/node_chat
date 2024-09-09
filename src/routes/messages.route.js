const express = require('express');
const messagesController = require('../controllers/messages.controller.js');

const messagesRoute = express.Router();

messagesRoute.post('/', messagesController.sendMessage);

module.exports = { messagesRoute };
