const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const catchError = require('../service/catchError.service');
const { body } = require('express-validator');
const express = require('express');

const authRouter = express.Router();

authRouter.post(
  '/registration',
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 }),
  catchError(authController.register),
);

authRouter.post('/login', catchError(authController.login));
authRouter.get('/logout', authMiddleware, catchError(authController.logout));
authRouter.get('/refresh', catchError(authController.refresh));

module.exports = authRouter;
