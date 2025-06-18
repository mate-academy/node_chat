import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';

export const authRouter = new express.Router();

authRouter.post('/login', catchError(authController.login));
authRouter.get('/user', catchError(authController.getUser));
