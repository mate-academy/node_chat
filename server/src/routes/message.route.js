import { Router } from 'express';
import { messagesController } from '../controllers/message.controller.js';

export const router = Router();

router.get('/', messagesController.getAllMessages);
router.post('/', messagesController.createMessage);
