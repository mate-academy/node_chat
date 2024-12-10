const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const Router = require('express').Router;
const { catchError } = require('../utils/catchError');

const authRoute = Router();

authRoute.post('/registration', catchError(authController.register));
authRoute.post('/login', catchError(authController.login));
authRoute.post('/logout', catchError(authController.logout));
authRoute.post('/send-reset', catchError(authController.sendResetPassword));
authRoute.get('/reset/:resetToken', catchError(authController.resetPassword));
authRoute.get('/activate/:token', catchError(authController.activate));
authRoute.get('/refresh', catchError(authController.refresh));

authRoute.post(
  '/send-reset-email',
  authMiddleware,
  catchError(authController.sendResetEmail),
);

authRoute.get(
  '/reset-email/:resetToken',
  authMiddleware,
  catchError(authController.resetEmail),
);

module.exports = { authRoute };
