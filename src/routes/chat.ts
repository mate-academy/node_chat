import express from 'express';
import {
  createMessage,
  getMessages,
  removeMessage,
  editMessage,
} from '../controllers/chat';

const router = express.Router();

router.post('/', createMessage);
router.get('/:room?', getMessages);
router.put('/:id', editMessage);
router.delete('/:id', removeMessage);

export default router;
