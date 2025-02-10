const { Router } = require('express');
const messageController = require('../controllers/message.controller');

const messageRoute = new Router();

messageRoute.post('/rooms/:roomId/messages', messageController.create);
messageRoute.get('/rooms/:roomId/messages', messageController.getMessages);

module.exports = {
  messageRoute,
};
