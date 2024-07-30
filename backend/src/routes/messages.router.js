const { Router } = require('express');
const { messagesController } = require('../controllers/messages.controller');

const messagesRouter = Router();

messagesRouter.get('/:id', messagesController.getRoomMessages);
messagesRouter.post('/', messagesController.createRoomMessage);

module.exports = {
  messagesRouter,
};
