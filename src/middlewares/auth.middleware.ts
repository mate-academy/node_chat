import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../utils/checks.js';
import { jwtService } from '../utils/jwt.js';
import pkg from 'jsonwebtoken';
const { JsonWebTokenError } = pkg;
import { userService } from '../services/user.service.js';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!token || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization header is missing or malformed');
  }

  try {
    const { userId, tokenVersion, sessionId } = jwtService.verify(token);
    const user = await userService.getOneById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    if (user.tokenVersion !== tokenVersion) {
      throw new UnauthorizedError('Session revoked');
    }
    req.user = { ...user, sessionId };
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    throw error;
  }

  return next();
};
