import { Router } from 'express';

import { usersController } from '../controllers/users.controller.js';
import { catchError } from '../utils/catchError.js';

export const usersRouter = Router();

usersRouter.post('/', catchError(usersController.createUser));
