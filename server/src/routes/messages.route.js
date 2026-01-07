import express from 'express';
import { messageController } from '../controllers/messages.controller.js';

export const messagesRouter = express.Router();

messagesRouter.get('/rooms/:id/messages', messageController.getAllByRoom);
messagesRouter.post('/rooms/:id/messages', messageController.create);
messagesRouter.delete('/rooms/:id/messages', messageController.removeAllByRoom);
