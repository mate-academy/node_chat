import { NextFunction, Request, Response } from 'express';

import { jwt } from '../utils/jwt';
import { ApiError } from '../exceptions/api.error';
import { AuthorizationTokenSchema } from '../schemas/token.schema';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const verifiedHeaders = req.headers as AuthorizationTokenSchema;
  const [, token] = verifiedHeaders['authorization'].split(' ');

  const normalizedUser = jwt.validateAccessToken(token);

  if (!normalizedUser) {
    throw ApiError.unauthorized('Invalid access token');
  }

  req.user = normalizedUser;

  next();
}
