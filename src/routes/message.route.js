import express from 'express';
import { messagesController } from '../controllers/messages.controller.js';

export const messageRouter = new express.Router();

messageRouter.get('/messages', messagesController.getAll);
messageRouter.get('/messages/chatRooms', messagesController.getRooms);
messageRouter.post('/messages/renameRoom', messagesController.renameChat);
messageRouter.post('/messages/delete', messagesController.removeChat);
