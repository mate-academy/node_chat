import express from 'express';
import { roomController } from '../controllers/rooms.controller.js';

export const roomsRoute = new express.Router();

roomsRoute.get('/', roomController.getAllRooms);
roomsRoute.post('/', roomController.createRoom);
roomsRoute.patch('/:roomId', roomController.updateRoom);
roomsRoute.delete('/:roomId', roomController.deleteRoom);
