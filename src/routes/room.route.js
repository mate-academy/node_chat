import { Router } from 'express';
import { catchError } from '../utils/catchError';
import { RoomController } from '../controllers/room.controller';

export const roomRouter = Router();

roomRouter.get('/get/:id', catchError(RoomController.join));
roomRouter.post('/create', catchError(RoomController.create));
roomRouter.delete('/remove/:id', catchError(RoomController.remove));
roomRouter.patch('/rename/:id', catchError(RoomController.rename));
