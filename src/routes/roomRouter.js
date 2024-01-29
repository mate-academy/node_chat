import express from 'express';

import { roomController } from '../controllers/roomController.js';

export const roomRouter = express.Router();

roomRouter.get('/rooms', roomController.getAll);
roomRouter.post('/rooms', roomController.create);
roomRouter.get('/rooms/:id', roomController.getOne);
roomRouter.delete('/rooms/:id', roomController.remove);
roomRouter.patch('/rooms/:id', roomController.update);
