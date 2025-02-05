import express from 'express';

import {
  createRoom,
  renameRoom,
  deleteRoom,
  getRoomMessage,
} from '../controllers/roomControllers.js';

const router = express.Router();

router.post('/', createRoom);
router.put('/', renameRoom);
router.delete('/', deleteRoom);
router.get('/:name', getRoomMessage);
export default router;
