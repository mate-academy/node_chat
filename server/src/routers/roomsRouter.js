import { Router } from 'express';
import { roomsController } from '../controllers/rooms.controller.js';
import { messagesRouter } from './messages.router.js';

export const roomsRouter = Router();

roomsRouter.use('/:roomId/messages', messagesRouter);

roomsRouter.get('/', roomsController.getAll);
roomsRouter.get('/:id', roomsController.getById);
roomsRouter.post('/', roomsController.createRoom);
roomsRouter.patch('/:id', roomsController.upDateRoom);
roomsRouter.delete('/:id', roomsController.deletedRoomById);
