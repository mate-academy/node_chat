import express from 'express';
import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';

export const roomRouter = new express.Router();

roomRouter.get('/rooms', catchError(roomController.getAllRooms));
roomRouter.post('/rooms', catchError(roomController.createRoom));
roomRouter.patch('/rooms/:roomId', catchError(roomController.renameRoom));
roomRouter.delete('/rooms/:roomId', catchError(roomController.removeRoom));
