import { Router } from 'express';
import { roomsController } from '../controllers/room.controller.js';

export const router = Router();

router.get('/:id', roomsController.getRoom);
router.get('/', roomsController.getRooms);
router.post('/', roomsController.createRoom);
router.patch('/:id', roomsController.updateRoom);
router.delete('/:id', roomsController.deleteRoom);
