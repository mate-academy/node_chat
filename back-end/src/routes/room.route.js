import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';
import { roomController } from '../controllers/room.controller.js';

export const roomRouter = new express.Router();

roomRouter.get('/rooms', authMiddleware, catchError(roomController.getAll));

roomRouter.post('/rooms', authMiddleware, catchError(roomController.create));

roomRouter.patch(
  '/rooms/:id',
  authMiddleware,
  catchError(roomController.rename),
);

roomRouter.post(
  '/rooms/:roomId/join',
  authMiddleware,
  catchError(roomController.join),
);

roomRouter.delete(
  '/rooms/:id',
  authMiddleware,
  catchError(roomController.remove),
);

roomRouter.get(
  '/rooms/:id',
  authMiddleware,
  catchError(roomController.getJoined),
);
