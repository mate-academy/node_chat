import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRooms,
  renameRoom,
} from '../controllers/roomController.js';
import {
  createMessage,
  getMessages,
} from '../controllers/messageController.js';
import { auth } from '../middleWare/authMiddleWare.js';

export const router = Router();

router.get('/', getRooms);
router.post('/auth', authenticate);
router.get('/room/:id', getRoom);
router.post('/room', auth, createRoom);
router.patch('/room/:id', auth, renameRoom);
router.delete('/room/:id', auth, deleteRoom);
router.post('/messages', auth, createMessage);
router.get('/messages', auth, getMessages);
