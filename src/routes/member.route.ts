import { Router } from 'express';
import { memberController } from '../controllers/member.controller';

export const memberRoute = Router({ mergeParams: true });

memberRoute.post('/', memberController.join);
memberRoute.delete('/me', memberController.leave);
