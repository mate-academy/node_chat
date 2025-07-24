'use strict';
import express from 'express';
import { roomController } from '../controllers/room.controller.js';

export const roomRouter = new express.Router();

roomRouter.get('/', roomController.getAllRooms);
roomRouter.post('/createRoom', roomController.createRoom);
roomRouter.put('/:roomId', roomController.updateTitle);
roomRouter.delete('/:roomId', roomController.deleteRoom);
