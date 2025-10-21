import express from 'express';
import { userController } from '../controllers/user.controller.js';

export const userRouter = express.Router();

userRouter.post('/users', userController.createUser);
userRouter.patch('/users/:id/join', userController.joinUser);
