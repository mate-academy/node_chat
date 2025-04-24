import express from 'express';
import {
  createRoom,
  renameRoom,
  deleteRoom,
  getAllRooms,
} from '../controllers/room.controller.js';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const roomRouter = express.Router();
roomRouter.get('/', authMiddleware, catchError(getAllRooms));

roomRouter.post('/create', authMiddleware, catchError(createRoom));

roomRouter.delete('/:id', authMiddleware, catchError(deleteRoom));

roomRouter.patch('/:id', authMiddleware, catchError(renameRoom));
