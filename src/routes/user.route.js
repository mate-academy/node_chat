import express from 'express';
import { catchError } from '../utils/catchError.js';
import { userController } from '../controllers/user.controller.js';

export const userRouter = new express.Router();

userRouter.post('/', catchError(userController.createUser));
