import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { authController } from '../controllers/auth.controller';

import { nameSchema } from '../schemas/name.schema';
import { tokenSchema } from '../schemas/token.schema';
import { validationMiddleware } from '../middlewares/validation.middleware';

export const authRoute = Router();

authRoute.post(
  '/registration',
  validationMiddleware(nameSchema),
  authController.register,
);

authRoute.post(
  '/refresh-token',
  cookieParser(),
  validationMiddleware(tokenSchema.refresh, 'cookies'),
  authController.refreshToken,
);
