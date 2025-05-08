import { Router } from 'express';

import { nameSchema } from '../schemas/name.schema';
import { tokenSchema } from '../schemas/token.schema';

import { authMiddleware } from '../middlewares/auth.middleware';
import { validationMiddleware } from '../middlewares/validation.middleware';

import { roomDetailRoute } from './room.detail.route';
import { roomController } from '../controllers/room.controller';

export const roomRoute = Router();

roomRoute.use(
  validationMiddleware(tokenSchema.authorization, 'headers'),
  authMiddleware,
);

roomRoute.get('/', roomController.getSummary);
roomRoute.post('/', validationMiddleware(nameSchema), roomController.create);

roomRoute.use('/:roomId', roomDetailRoute);
