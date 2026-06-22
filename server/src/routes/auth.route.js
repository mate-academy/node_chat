import express from 'express';
import { catchError } from '../utils/catchError.js';
import { authContorller } from '../controllers/auth.controller.js';

export const authRouter = express.Router();

authRouter.post('/login', catchError(authContorller.login));
