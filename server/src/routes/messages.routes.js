const express = require('express');
const { httpAddNewMessage } = require('../controllers/messages.controller');

const messagesRoutes = express.Router();

messagesRoutes.post('/', httpAddNewMessage);

module.exports = messagesRoutes;
