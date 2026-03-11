import { Router } from 'express';
import roomController from '../controllers/room.controller';
import { catchAsync } from '../utils/catchAsync';

export const router = Router();

router.get('/', catchAsync(roomController.get));
router.get('/:id', catchAsync(roomController.getMessages));
router.post('/', catchAsync(roomController.create));
router.delete('/:id', catchAsync(roomController.deleteRoom));
router.patch('/:id', catchAsync(roomController.change));
