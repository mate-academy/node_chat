import express from 'express';
import { catchError } from '../utils/catchError.js';
import { messageController } from '../controllers/message.controller.js';

export const messageRouter = express.Router({ mergeParams: true });

messageRouter.get('/', catchError(messageController.getByRoom));
messageRouter.post('/', catchError(messageController.create));
