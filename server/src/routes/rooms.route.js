import express from 'express';
import { roomsController } from '../controller/rooms.controller.js';

export const roomsRouter = express.Router();

roomsRouter.get('/', roomsController.getAll);
roomsRouter.get('/:roomId', roomsController.getOneRoom);
roomsRouter.post('/', roomsController.create);
roomsRouter.delete('/:roomId', roomsController.removeRoom);
roomsRouter.post('/join/:roomId', roomsController.join);
roomsRouter.post('/quit/:roomId', roomsController.quitRoom);
roomsRouter.patch('/rename/:roomId', roomsController.renameRoom);
