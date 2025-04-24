import express from 'express';
import { catchError } from '../utils/catchError.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAllMessages } from '../controllers/messages.controller.js';

export const messageRouter = express.Router();
messageRouter.get('/:roomName', authMiddleware, catchError(getAllMessages));
