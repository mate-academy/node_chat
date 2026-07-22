import { randomUUID } from 'node:crypto';
import { rooms, users } from '../store/store.js';
import type { User } from '../utils/types/types.js';
import express, { Router, type Request, type Response } from 'express';

export const userRouter: Router = express.Router();

userRouter.post(
  '',
  (
    req: Request<{}, {}, { username: string; colorHuePercent: number }>,
    res: Response,
  ) => {
    const { username, colorHuePercent } = req.body;

    if (!username) {
      return res.sendStatus(400);
    }

    const newUser: User = {
      id: randomUUID().toString(),
      username,
      colorHuePercent,
      accessToken: randomUUID().toString(),
    };

    users.push(newUser);
    res.status(201).send(newUser);
  },
);

userRouter.get('/all', (req: Request<{}, {}, {}, {}>, res: Response) => {
  const normalizedUsers = users.map((user) => {
    const { accessToken, ...normalizedUser } = user;

    return normalizedUser;
  });

  res.send(normalizedUsers);
});

userRouter.get(
  '/:userId',
  (req: Request<{ userId?: string }, {}, {}>, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      return res.sendStatus(400);
    }

    const foundUser = users.find((user) => user.id === userId);

    if (!foundUser) {
      return res.sendStatus(404);
    }

    res.send(foundUser);
  },
);

userRouter.get(
  '/',
  (req: Request<{}, {}, {}, { roomId?: string }>, res: Response) => {
    const { roomId } = req.query;

    if (!roomId) {
      return res.sendStatus(404);
    }

    const foundRoom = rooms.find((room) => room.id === roomId);

    if (!foundRoom) {
      return res.sendStatus(404);
    }

    const usersByRoom: Omit<User, 'accessToken'>[] = [];

    [...foundRoom.usersId, foundRoom.ownerId].forEach((userId) => {
      const foundUser = users.find((us) => us.id === userId);

      if (foundUser) {
        const { accessToken, ...normalizeUser } = foundUser;

        usersByRoom.push(normalizeUser);
      }
    });

    res.send(usersByRoom);
  },
);
