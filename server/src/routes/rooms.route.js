import express from 'express';
import { roomController } from '../controllers/rooms.controller.js';

export const roomsRouter = new express.Router();

roomsRouter.get('/rooms', roomController.getAll);

roomsRouter.post('/rooms', roomController.create);

roomsRouter.patch('/rooms/:id', roomController.edit);

roomsRouter.delete('/rooms/:id', roomController.remove);
