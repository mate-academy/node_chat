import express from 'express';
import { userController } from '../controllers/userController.js';

export const userRouter = express.Router();

userRouter.get('/user/:userId', userController.getUser);
userRouter.post('/user', userController.saveUser);
