'use strict';

import express from 'express';
import {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getAllMessages);
router.get('/:id', getMessageById);
router.post('/', createMessage);
router.put('/:id', updateMessage);
router.patch('/:id', updateMessage);
router.delete('/:id', deleteMessage);

export default router;
