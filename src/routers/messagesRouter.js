'use strict';

const express = require('express');
const { catchErrorMW } = require('../middlewares/catchErrorMW');
const { messagesController } = require('../controllers/messagesController');

const messagesRouter = new express.Router();

messagesRouter.get('/:chatId', catchErrorMW(messagesController.get));
messagesRouter.post('/:chatId', catchErrorMW(messagesController.create));

module.exports = { messagesRouter };
