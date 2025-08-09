import express from 'express';
import { messageController } from '../controllers/message.controller.js';

export const messageRoute = new express.Router();

messageRoute.get('/rooms/:roomId/messages', messageController.getMessages);
messageRoute.post('/rooms/:roomId/messages', messageController.create);
