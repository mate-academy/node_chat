import express from 'express';
import {
  activate,
  registration,
  login,
  logout,
  refresh,
  sendResetPassword,
  resetUserPassword,
} from '../controllers/auth.controller.js';
import { catchError } from '../utils/catchError.js';
export const authRouter = express.Router();
authRouter.post('/registration', catchError(registration));

authRouter.get('/activate/:activationToken', catchError(activate));

authRouter.post('/login', catchError(login));

authRouter.post('/logout', catchError(logout));

authRouter.get('/refresh', catchError(refresh));

authRouter.post('/password-reset', catchError(sendResetPassword));

authRouter.post('/password-reset/:resetToken', catchError(resetUserPassword));
