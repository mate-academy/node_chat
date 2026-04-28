import { Request, Response } from 'express';
import { users } from '../models/store.js';

export function create(req: Request, res: Response): void {
  const { username } = req.body;
  users.push(username);
  res.status(201).send(users);
}
