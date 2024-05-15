import express from 'express';
import { messagesController } from '../controllers/messagesController.js';

export const messageRouter = new express.Router();

messageRouter.post('/messages/delete', messagesController.remove);
messageRouter.get('/messages/chatRooms', messagesController.getRooms);
messageRouter.get('/messages', messagesController.getAll);
messageRouter.post('/messages/renameRoom', messagesController.rename);
