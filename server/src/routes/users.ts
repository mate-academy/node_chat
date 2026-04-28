import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

router.post('/', userController.create);

export default router;
