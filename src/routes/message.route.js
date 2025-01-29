import express from 'express';
import { catchError } from '../utils/catchError.js';
import { messageController } from '../controllers/message.controller.js';

export const messageRouter = express.Router();

messageRouter.get('/:id', catchError(messageController.getMessagesByRoomId));

messageRouter.post('/', catchError(messageController.createNewMessage));
