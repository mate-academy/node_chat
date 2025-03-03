import express from 'express';
import { roomController } from '../controllers/room.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { validationSchemas } from '../utils/validation.js';

export const roomRouter = new express.Router();

roomRouter.get('/', authMiddleware, roomController.getAllRooms);

roomRouter.post(
  '/',
  authMiddleware,
  validateMiddleware(validationSchemas.roomSchema),
  roomController.create,
);

roomRouter.patch('/:roomId', authMiddleware, roomController.update);

roomRouter.delete('/:roomId', authMiddleware, roomController.remove);
