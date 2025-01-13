import express from 'express';
import { catchError } from '../utils/catchError.js';
import { messageController } from '../controllers/message.controller.js';

export const messageRoute = new express.Router();

messageRoute.post('/', catchError(messageController.addMessage))
messageRoute.get('/:roomId', catchError(messageController.getMessages))
