import { Router } from 'express';
import * as roomController from '../controllers/room.controller.js';

const roomRoute = new Router();

roomRoute.post('/', roomController.create);
roomRoute.get('/', roomController.getAllRooms);
roomRoute.patch('/:roomId', roomController.update);
roomRoute.delete('/:roomId', roomController.remove);

module.exports = {
  roomRoute,
};
