import { Router } from 'express';
import { messageController } from '../controllers/message.controller.js';

const messageRouter = Router();

messageRouter.get('/messages', messageController.getAll);
messageRouter.get('/messages/:roomId', messageController.getByRoom);
messageRouter.post('/messages', messageController.add);
messageRouter.delete('/messages/:roomId', messageController.deleteByRoom);

export { messageRouter };
