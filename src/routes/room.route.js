import { Router } from 'express';
import { roomController } from '../controllers/room.controller.js';

const roomRouter = Router();

roomRouter.get('/rooms', roomController.getAll);
roomRouter.post('/rooms', roomController.add);
roomRouter.post('/rooms/:id/join', roomController.joinRoom);
roomRouter.patch('/rooms/:id', roomController.rename);
roomRouter.delete('/rooms/:id', roomController.deleteRoom);

export { roomRouter };
