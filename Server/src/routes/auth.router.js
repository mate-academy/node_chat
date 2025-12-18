import express from 'express'
import { authController } from '../controlers/auth.controler.js';

export const authRouter = new express.Router();
authRouter.get('/rooms/:roomId/messages', authController.getMessages)
authRouter.post('/messages', authController.sendMessage);
authRouter.post('/login', authController.register);
authRouter.post('/logout', authController.logout)
