import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roomController from '../controllers/room.controller.js';

const router = Router();

router.get('/', authMiddleware, roomController.getRooms);
router.post('/', authMiddleware, roomController.createRoom);
router.delete('/:id', authMiddleware, roomController.deleteRoom);
router.put('/:id', authMiddleware, roomController.renameRoom);

export default router;
