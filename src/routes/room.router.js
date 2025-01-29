import express from 'express';
import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';

export const roomRouter = express.Router();

roomRouter.get('/', catchError(roomController.getAllRooms));
roomRouter.post('/', catchError(roomController.createRoom));
roomRouter.patch('/:id', catchError(roomController.renameRoom));
roomRouter.delete('/:id', catchError(roomController.deleteRoom));
