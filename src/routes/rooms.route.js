import { Router } from 'express';
import { roomController } from '../controllers/room.controller.js';

const route = Router();

route.post('/', roomController.createRoom);
route.get('/', roomController.getAllRooms);
route.delete('/:roomId', roomController.deleteRoom);
route.put('/:roomId', roomController.updateRoom);
route.post('/:roomId/join', roomController.joinRooms);

export default route;
