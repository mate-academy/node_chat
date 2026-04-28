import { Router } from 'express';
import * as messageController from '../controllers/messageController.js';

const router = Router();

router.post('/', messageController.create);

export default router;
