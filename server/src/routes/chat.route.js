const express = require('express');
const chatController = require('../controllers/chat.controller.js');
const catchError = require('../middlewares/catchError.js');

const chatRoute = express.Router();

chatRoute.post('/', catchError(chatController.createChat));
chatRoute.get('/:userId', catchError(chatController.findUserChats));
chatRoute.get('/', catchError(chatController.findChat));

module.exports = chatRoute;
