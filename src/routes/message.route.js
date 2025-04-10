import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';

const messageRoute = new Router();

messageRoute.get('/rooms/:roomId/messages', messageController.getMessages);
messageRoute.post('/rooms/:roomId/messages', messageController.create);

module.exports = { messageRoute };
