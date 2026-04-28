import { Router } from 'express';
import * as roomController from '../controllers/roomController.js';

const router = Router();

router.get('/', roomController.getAll);
router.post('/', roomController.create);
router.patch('/:id', roomController.rename);
router.delete('/:id', roomController.remove);
router.get('/:id/messages', roomController.getMessages);

export default router;
