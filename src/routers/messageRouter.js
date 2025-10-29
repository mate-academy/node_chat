import express from 'express';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { messageController } from '../controllers/messageController.js';

export const messageRouter = express.Router();

messageRouter.post(
  '/create',
  authMiddleware,
  catchError(messageController.create),
);

messageRouter.get('/', authMiddleware, catchError(messageController.get));
