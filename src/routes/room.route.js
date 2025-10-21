import express from 'express';
import { roomsController } from '../controllers/rooms.controller.js';

export const roomRouter = express.Router();

roomRouter.get('/rooms', roomsController.getAllRooms);
roomRouter.post('/rooms', roomsController.createRoom);
roomRouter.patch('/rooms/:id', roomsController.updateRoom);
roomRouter.delete('/rooms/:id', roomsController.deleteRoom);
