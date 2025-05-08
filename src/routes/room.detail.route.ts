import { Router } from 'express';

import { nameSchema } from '../schemas/name.schema';
import { roomIdSchema } from '../schemas/roomId.schema';
import { validationMiddleware } from '../middlewares/validation.middleware';

import { memberRoute } from './member.route';
import { messageRoute } from './message.route';
import { roomController } from '../controllers/room.controller';

export const roomDetailRoute = Router({ mergeParams: true });

roomDetailRoute.use(validationMiddleware(roomIdSchema, 'params'));

roomDetailRoute.get('/', roomController.getWithRole);
roomDetailRoute.delete('/', roomController.delete);

roomDetailRoute.patch(
  '/',
  validationMiddleware(nameSchema),
  roomController.changeName,
);

roomDetailRoute.use('/members', memberRoute);
roomDetailRoute.use('/messages', messageRoute);
