import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { validateMiddleware } from '../middlewares/validateMiddleware.js';
import { validationSchemas } from '../utils/validation.js';

export const userRouter = new express.Router();

userRouter.post(
  '/',
  validateMiddleware(validationSchemas.userSchema),
  userController.create,
);
