import express from 'express';
import { message } from '../controllers/message.js';
import { catchError } from '../utils/catchError.js';

export const messageRouter = new express.Router();

messageRouter.get('/messages/:id', catchError(message.getAllMessagesByRoomId));
messageRouter.post('/messages', catchError(message.createNewMessage));
