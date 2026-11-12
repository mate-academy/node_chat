import express from 'express';

import {
  getRooms,
  createRoom,
  renameRoom,
  deleteRoom,
} from '../controllers/roomController.js';

import { getMessages } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', getRooms);
router.post('/', createRoom);

router.patch('/:id', renameRoom);
router.delete('/:id', deleteRoom);

router.get('/:id/messages', getMessages);

export default router;
