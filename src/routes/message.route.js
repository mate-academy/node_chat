import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import messageController from '../controllers/message.controller.js';

const router = Router();

router.get('/:roomId', authMiddleware, messageController.getMessages);
router.post('/:roomId', authMiddleware, messageController.createMessage);

export default router;
