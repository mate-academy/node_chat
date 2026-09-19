import express from 'express';
import { authController } from '../controller/auth.controller.js';

export const authRouter = express.Router();

authRouter.post('/login', authController.login);
