import type { NextFunction, Request, Response } from 'express';
import { users } from '../store/store.js';
import type { User } from '../utils/types/types.js';

export async function authMiddleware(
  req: Request,
  res: Response<{}, { user: User }>,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const foundUser = users.find((item) => item.accessToken === accessToken);

  if (!foundUser) {
    return res.status(401).json({ message: 'Token is invalid' });
  }

  res.locals.user = foundUser;

  next();
}
