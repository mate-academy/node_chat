import express from 'express';
import { catchError } from '../utils/catchError.js';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  activationEmailRateLimitMiddleware,
  activationIpRateLimitMiddleware,
  activationTokenRateLimitMiddleware,
  googleLoginRateLimitMiddleware,
  loginRateLimitMiddleware,
  logoutRateLimitMiddleware,
  passwordResetEmailRateLimitMiddleware,
  passwordResetIpRateLimitMiddleware,
  passwordResetTokenRateLimitMiddleware,
  refreshRateLimitMiddleware,
  registerRateLimitMiddleware,
} from '../middlewares/rateLimit.middleware.js';

export const userRouter = express.Router();

userRouter.post(
  '/register',
  catchError(registerRateLimitMiddleware),
  catchError(userController.register),
);

userRouter.get(
  '/me',
  catchError(authMiddleware),
  catchError(userController.getMe),
);

userRouter.patch(
  '/me',
  catchError(authMiddleware),
  catchError(userController.update),
);

userRouter.patch(
  '/me/password',
  catchError(authMiddleware),
  catchError(userController.updatePassword),
);

userRouter.delete(
  '/me',
  catchError(authMiddleware),
  catchError(userController.delete),
);

userRouter.post(
  '/login',
  catchError(loginRateLimitMiddleware),
  catchError(userController.login),
);

userRouter.post(
  '/google',
  catchError(googleLoginRateLimitMiddleware),
  catchError(userController.loginWithGoogle),
);

userRouter.get(
  '/activation/:activationToken',
  catchError(activationTokenRateLimitMiddleware),
  catchError(userController.activate),
);

userRouter.post(
  '/activation',
  catchError(activationIpRateLimitMiddleware),
  catchError(activationEmailRateLimitMiddleware),
  catchError(userController.resendActivation),
);

userRouter.post(
  '/refresh',
  catchError(refreshRateLimitMiddleware),
  catchError(userController.refresh),
);

userRouter.post(
  '/password-reset',
  catchError(passwordResetIpRateLimitMiddleware),
  catchError(passwordResetEmailRateLimitMiddleware),
  catchError(userController.requestPasswordReset),
);

userRouter.post(
  '/password-reset/:resetToken',
  catchError(passwordResetTokenRateLimitMiddleware),
  catchError(userController.confirmPasswordReset),
);

userRouter.post(
  '/logout',
  catchError(logoutRateLimitMiddleware),
  catchError(userController.logout),
);

userRouter.post(
  '/logout-all',
  catchError(authMiddleware),
  catchError(userController.logoutAll),
);

userRouter.get(
  '/sessions',
  catchError(authMiddleware),
  catchError(userController.getSessions),
);

userRouter.delete(
  '/sessions/:sessionId',
  catchError(authMiddleware),
  catchError(userController.revokeSession),
);

userRouter.get(
  '/search',
  catchError(authMiddleware),
  catchError(userController.search),
);
