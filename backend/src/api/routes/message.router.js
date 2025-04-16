const { Router } = require('express');
const { catchError } = require('../../utils/catchError');
const messageController = require('../controllers/message.controller');

const messageRouter = Router();

messageRouter.get('/', catchError(messageController.getAllMessages));
messageRouter.post('/', catchError(messageController.createMessage));
messageRouter.delete('/:id', catchError(messageController.deleteMessage));
messageRouter.patch('/:id', catchError(messageController.updateMessage));

module.exports = messageRouter;
