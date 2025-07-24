'use strict';
import express from 'express';
import { userController } from '../controllers/user.controller.js';

export const userRouter = new express.Router();

userRouter.post('/', userController.newUser);
