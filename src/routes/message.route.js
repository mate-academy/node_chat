import express from 'express';
import { catchError } from '../utils/catchError.js';
import { messageController } from '../controllers/message.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const messageRouter = new express.Router();

messageRouter.get(
  '/rooms/:roomId/messages',
  authMiddleware,
  catchError(messageController.getAllMessages),
);

messageRouter.post(
  '/rooms/:roomId/messages',
  authMiddleware,
  catchError(messageController.createMessage),
);
