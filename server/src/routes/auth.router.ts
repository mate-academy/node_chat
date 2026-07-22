import express, { Router, type Request, type Response } from 'express';
import { users } from '../store/store.js';

export const authRouter: Router = express.Router();

authRouter.get('/me', (req: Request, res: Response) => {
  const [, accessToken] = req.header('authorization')?.split(' ') || [
    undefined,
    undefined,
  ];

  if (!accessToken) {
    return res.sendStatus(400);
  }

  // todo validation

  const foundUser = users.find((user) => user.accessToken === accessToken);

  if (!foundUser) {
    return res.sendStatus(404);
  }

  res.send(foundUser);
});
