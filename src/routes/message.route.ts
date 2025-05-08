import { Router } from 'express';
import { messageController } from '../controllers/message.controller';

import { textSchema } from '../schemas/text.schema';
import { validationMiddleware } from '../middlewares/validation.middleware';

export const messageRoute = Router({ mergeParams: true });

messageRoute.get('/', messageController.getAll);

messageRoute.post(
  '/',
  validationMiddleware(textSchema),
  messageController.create,
);
