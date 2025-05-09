import express from 'express';
import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const roomsRouter = new express.Router();

roomsRouter.get('/', authMiddleware, catchError(roomController.getAllRooms));

roomsRouter.get(
  '/:roomId',
  authMiddleware,
  catchError(roomController.getRoomById),
);
roomsRouter.post('/', authMiddleware, catchError(roomController.createRoom));

roomsRouter.patch(
  '/:roomId',
  authMiddleware,
  catchError(roomController.updateRoom),
);

roomsRouter.delete(
  '/:roomId',
  authMiddleware,
  catchError(roomController.deleteRoom),
);
