const express = require('express');
const { messageController } = require('../controller/message.controller');

const messageRouter = new express.Router();

messageRouter.post('/send', messageController.send);
messageRouter.get('/getMessages', messageController.getAll);
messageRouter.post('/last', messageController.getLastMessageByRoomId);

module.exports = { messageRouter };
