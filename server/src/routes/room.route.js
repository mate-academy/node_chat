import express from 'express';
import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';
import { messageRouter } from './message.route.js';

export const roomRouter = express.Router();

roomRouter.get('/', catchError(roomController.getAll));
roomRouter.post('/', catchError(roomController.create));
roomRouter.put('/:id', catchError(roomController.rename));
roomRouter.delete('/:id', catchError(roomController.remove));
roomRouter.post('/:id/join', catchError(roomController.join));

roomRouter.use('/:roomId/messages', messageRouter);
