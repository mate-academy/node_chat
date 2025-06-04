import express from 'express';
import { roomsController } from '../controllers/roomsController.js';

export const roomsRouter = express.Router();

roomsRouter.post('/rooms', express.json(), roomsController.createNew);
roomsRouter.patch('/rooms/:roomId', express.json(), roomsController.joinRoom);
roomsRouter.patch('/rooms', express.json(), roomsController.change);
roomsRouter.delete('/rooms', roomsController.crearAll);
