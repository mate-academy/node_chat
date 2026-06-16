import express from 'express';
import { messageController } from '../controllers/message.controller.js';

export const messageRouter = express.Router();

messageRouter.post('/rooms/:roomId/messages', messageController.createMessage);
messageRouter.get('/rooms/:roomId/messages', messageController.getMessages);
