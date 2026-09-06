import express from 'express';
import { messageController } from '../controllers/messageController.js';

export const messageRouter = express.Router();

messageRouter.get('/chat', messageController.getMessages);
messageRouter.get('/rooms/:roomId', messageController.getMessages);
messageRouter.post('/chat', messageController.sendMessage);
messageRouter.post('/rooms/:roomId', messageController.sendMessage);
