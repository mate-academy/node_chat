import express from 'express';
import { messageController } from '../controllers/message.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { validationSchemas } from '../utils/validation.js';

export const messageRouter = new express.Router();

messageRouter.get(
  '/rooms/:roomId/messages',
  authMiddleware,
  messageController.getAllMessages,
);

messageRouter.post(
  '/rooms/:roomId/messages',
  authMiddleware,
  validateMiddleware(validationSchemas.messageSchema),
  messageController.create,
);
