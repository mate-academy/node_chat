import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';

const messageRoute = new Router();

messageRoute.post('/rooms/:roomId/messages', messageController.create);
messageRoute.get('/rooms/:roomId/messages', messageController.getMessages);

module.exports = {
  messageRoute,
};
