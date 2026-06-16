import express from 'express';
import { roomController } from '../controllers/room.controller.js';

export const roomRouter = express.Router();

roomRouter.get('/rooms', roomController.getRooms);
roomRouter.post('/rooms', roomController.createRoom);
roomRouter.patch('/rooms/:roomId', roomController.updateRoom);
roomRouter.delete('/rooms/:roomId', roomController.deleteRoom);
