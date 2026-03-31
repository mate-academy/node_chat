import { Router } from 'express';

import { catchError } from '../utils/catchError.js';
import { roomsController } from '../controllers/rooms.controller.js';

export const roomsRouter = Router();

roomsRouter.post('/', catchError(roomsController.createRoom));
roomsRouter.get('/room/:id', catchError(roomsController.getRoom));
roomsRouter.patch('/room/:id/add-user', catchError(roomsController.joinToRoom));

roomsRouter.patch(
  '/room/:id/remove-user',
  catchError(roomsController.leaveTheRoom),
);
roomsRouter.patch('/room/:id', catchError(roomsController.renameRoom));
roomsRouter.delete('/room/:id', catchError(roomsController.deleteRoom));
roomsRouter.get('/:userId', catchError(roomsController.getAllRooms));
