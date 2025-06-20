import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { messageController } from '../controllers/message.controller.js';

export const messageRouter = new express.Router();

messageRouter.get(
  '/messages/:roomId',
  authMiddleware,
  catchError(messageController.getMessages),
);

messageRouter.post(
  '/messages/:roomId',
  authMiddleware,
  catchError(messageController.sendMessage),
);
