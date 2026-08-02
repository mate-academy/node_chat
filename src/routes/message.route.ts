import express from 'express';
import { catchError } from '../utils/catchError.js';
import { messageController } from '../controllers/message.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const messageRouter = express.Router();

messageRouter.use(catchError(authMiddleware));

messageRouter.get(
  '/room/:roomId',
  catchError(messageController.getAllByRoomId),
);
messageRouter.get('/:messageId', catchError(messageController.getOneById));
messageRouter.post('/', catchError(messageController.create));
messageRouter.delete('/:messageId', catchError(messageController.delete));
messageRouter.put('/:messageId', catchError(messageController.update));
