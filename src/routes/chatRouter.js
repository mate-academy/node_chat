import express from 'express';
import { catchError } from '../utils/CatchErorr.js';
import { chatController } from '../controllers/chatController.js';

export const chatRouter = new express.Router();

chatRouter.post('/createRoom', catchError(chatController.createRoom));
chatRouter.get('/rooms', catchError(chatController.getAllRooms));
chatRouter.delete('/rooms/:roomId', catchError(chatController.remove));

chatRouter.post('/:roomId/messages', catchError(chatController.messages));
chatRouter.get('/:roomId/messages', catchError(chatController.getMessage));

chatRouter.get(
  '/:roomId/messages/all',
  catchError(chatController.getAllMessages),
);
