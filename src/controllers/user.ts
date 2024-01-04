import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { UNAUTHORIZED, CREATED, OK } from '../constants/httpStatusCodes';
import { INVALID_CREDENTIALS } from '../constants/errorMessages';

dotenv.config();

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

export const register = async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;

    const user = await User.create({
      username,
      password,
    });

    const token = generateToken(user._id.toString());

    res.status(CREATED).json({ token });
  } catch (err) {
    next(err);
  }
};

export const login = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(UNAUTHORIZED).json({ message: INVALID_CREDENTIALS });
    }

    const token = generateToken(user._id.toString());

    res.status(OK).json({ token });
  } catch (err) {
    next(err);
  }
};
