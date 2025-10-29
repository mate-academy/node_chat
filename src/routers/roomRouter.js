import express from 'express';
import { roomController } from '../controllers/roomController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { catchError } from '../utils/catchError.js';

export const roomRouter = express.Router();

roomRouter.post('/create', authMiddleware, catchError(roomController.create));
roomRouter.get('/all', authMiddleware, catchError(roomController.get));

roomRouter.get(
  '/user-rooms',
  authMiddleware,
  catchError(roomController.getUserRooms),
);
roomRouter.post('/join', authMiddleware, catchError(roomController.join));
roomRouter.delete('/delete', authMiddleware, catchError(roomController.remove));
roomRouter.patch('/update', authMiddleware, catchError(roomController.edit));
