import express from 'express';
import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';

export const roomRouter = new express.Router();

roomRouter.get('/', catchError(roomController.get));
roomRouter.post('/', catchError(roomController.create));
roomRouter.patch('/:roomId', catchError(roomController.rename));
roomRouter.delete('/:roomId', catchError(roomController.remove));
