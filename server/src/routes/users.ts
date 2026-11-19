import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { asyncHandler, isUniqueViolation } from '../utils/http';

export const usersRouter = Router();

const usersRepo = () => AppDataSource.getRepository(User);

usersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const username = String(req.body?.username ?? '').trim();

    if (username.length < 1 || username.length > 50) {
      res.status(400).json({ error: 'Username must be 1-50 characters' });
      return;
    }

    try {
      const user = await usersRepo().save(usersRepo().create({ username }));
      res.status(201).json(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        res.status(409).json({ error: 'Username is already taken' });
        return;
      }
      throw error;
    }
  }),
);

usersRouter.get(
  '/:username',
  asyncHandler(async (req, res) => {
    const username = String(req.params.username);
    const user = await usersRepo().findOneBy({ username });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  }),
);
