import { Router } from 'express';
import { catchError } from '../utils/catchError';
import { messageController } from '../controllers/message.controller';

export const messageRouter = Router();

messageRouter.get('/create', catchError(messageController.create));
