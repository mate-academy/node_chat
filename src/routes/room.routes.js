import express from 'express';
import { roomController } from '../controllers/room.controller.js';
import { catchError } from '../utils/catchError.js';

export const roomRouter = new express.Router();

roomRouter.post('/', catchError(roomController.create));
roomRouter.patch('/:id', catchError(roomController.changeName));
roomRouter.post('/:id/join', catchError(roomController.join));
roomRouter.delete('/:id', catchError(roomController.remove));
roomRouter.post('/:id/messages', catchError(roomController.addMessage));

roomRouter.get(
  '/:id/messages?userId',
  catchError(roomController.getAllMessages),
);
