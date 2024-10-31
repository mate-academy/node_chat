import express from 'express';
import { userController } from '../controllers/userController.js';

export const userRouter = express.Router();

userRouter.post('/login', userController.login);
userRouter.get('/getAllChats', userController.getAllChats);
userRouter.patch('/newMessage', userController.setNewMessage);
userRouter.put('/createNewChat', userController.createNewChat);
userRouter.post('/room/:roomId', userController.joinRoom);
userRouter.patch('/room-rename', userController.roomRename);
userRouter.delete('/room-delete/:roomId', userController.deleteRoom);
