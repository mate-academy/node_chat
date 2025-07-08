const usersController = require('../controllers/users.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const catchError = require('../service/catchError.service');
const express = require('express');

const usersRouter = express.Router();

usersRouter.get(
  '/:userId',
  authMiddleware,
  catchError(usersController.getUser),
);

module.exports = usersRouter;
