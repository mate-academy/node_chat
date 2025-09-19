import express from 'express';
import { userController } from '../controllers/user.controller.js';
import { catchError } from '../utils/catchError.js';
import { isAuth } from '../midlewares/isAuth.js';
import { isNotAuth } from '../midlewares/isNotAuth.js';

export const userRouter = express.Router();

userRouter.post(
  '/',
  catchError(isNotAuth),
  catchError(userController.createUser),
);

userRouter.get(
  '/:userId',
  catchError(isAuth),
  catchError(userController.getUserInfo),
);

userRouter.patch(
  '/:userId',
  catchError(isAuth),
  catchError(userController.changeUserName),
);

userRouter.delete(
  '/:userId',
  catchError(isAuth),
  catchError(userController.deleteUser),
);
