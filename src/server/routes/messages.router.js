import { Router } from 'express';

import { catchError } from '../utils/catchError.js';
import { messagesController } from '../controllers/messages.controller.js';

export const messagesRouter = Router();

messagesRouter.post(
  '/:roomId/messages',
  catchError(messagesController.createMessage),
);
