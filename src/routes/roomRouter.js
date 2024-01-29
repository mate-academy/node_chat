import express from 'express';

import { roomController } from '../controllers/roomController.js';

export const roomRouter = express.Router();

roomRouter.get('/', roomController.getAll);
roomRouter.post('/', roomController.create);
roomRouter.get('/:id', roomController.getOne);
roomRouter.delete('/:id', roomController.remove);
roomRouter.patch('/:id', roomController.update);
