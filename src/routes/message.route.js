import express from 'express';
import { catchError } from '../utils/catchError.js';
import { messageController } from '../controllers/message.controller.js';

export const messageRouter = new express.Router();

messageRouter.get(
  '/messages/:roomId',
  catchError(messageController.getAllMessagesByRoomID),
);

messageRouter.post(
  '/messages/:roomId',
  catchError(messageController.createMessageByRoomId),
);
