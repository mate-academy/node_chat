'use strict';

const express = require('express');
const { catchErrorMW } = require('../middlewares/catchErrorMW.js');
const { chatsController } = require('../controllers/chatsController.js');

const chatsRouter = new express.Router();

chatsRouter.post('/new', catchErrorMW(chatsController.create));
chatsRouter.patch('/:chatId', catchErrorMW(chatsController.update));
chatsRouter.patch('/leave/:chatId', catchErrorMW(chatsController.leave));
chatsRouter.patch('/remove/:chatId', catchErrorMW(chatsController.remove));

module.exports = { chatsRouter };
