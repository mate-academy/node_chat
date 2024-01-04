import express from 'express';
import {
  createRoom,
  getRooms,
  renameRoom,
  joinRoom,
  removeRoom,
} from '../controllers/room';

const router = express.Router();

router.post('/', createRoom);
router.get('/', getRooms);
router.put('/:id', renameRoom);
router.post('/:id/join', joinRoom);
router.delete('/:id', removeRoom);

export default router;
