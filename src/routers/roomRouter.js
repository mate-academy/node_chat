import express from 'express';
import { roomController } from '../controllers/roomController.js';

export const roomRouter = express.Router();

roomRouter.get('/rooms', roomController.getRooms);
roomRouter.post('/rooms', roomController.createRoom);
roomRouter.patch('/rooms', roomController.renameRoom);
roomRouter.delete('/rooms', roomController.deleteRoom);
roomRouter.patch('/rooms/join', roomController.joinRoom);
roomRouter.patch('/rooms/leave', roomController.leaveRoom);
roomRouter.get('/rooms/:roomId/users/:userId', roomController.isUserInRoom);
