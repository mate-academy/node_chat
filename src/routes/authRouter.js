import express from 'express';
import { catchError } from '../utils/CatchErorr.js';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = new express.Router();

authRouter.post('/registration', catchError(authController.register));
authRouter.post('/login', catchError(authController.login));
authRouter.get('/refresh', catchError(authController.refresh));
authRouter.post('/logout', catchError(authController.logout));
