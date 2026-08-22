import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createRoom,
  renameRoom,
  joinUser,
  leaveRoom,
  deleteRoom,
  getRoomMessages,
  getRooms,
  createUser,
} from '../controllers/controllers.js';

const router = express.Router();

router.post('/rooms', asyncHandler(createRoom));
router.patch('/rooms/:roomId', asyncHandler(renameRoom));
router.post('/rooms/:roomId/join', asyncHandler(joinUser));
router.delete('/rooms/:roomId/leave', asyncHandler(leaveRoom));
router.delete('/rooms/:roomId', asyncHandler(deleteRoom));
router.get('/rooms/:roomId/messages', asyncHandler(getRoomMessages));
router.get('/rooms', asyncHandler(getRooms));
router.post('/users', asyncHandler(createUser));

export default router;
