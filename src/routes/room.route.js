import express from 'express';

import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';

export const roomRouter = new express.Router();

roomRouter.get('/', catchError(roomController.getAllRooms));

roomRouter.get('/:roomId', catchError(roomController.getRoomInfo));

roomRouter.post('/create', catchError(roomController.createNewRoom));

roomRouter.get('/:roomId/join', catchError(roomController.getAllMessages));

roomRouter.post('/:roomId/join', catchError(roomController.createNewMessage));

roomRouter.patch('/:roomId/rename', catchError(roomController.changeRoomName));

roomRouter.delete('/:roomId/delete', catchError(roomController.deleteRoom));
