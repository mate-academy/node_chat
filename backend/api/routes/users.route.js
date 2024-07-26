const express = require('express');
const { catchError } = require('../utils/catchError');
const { usersController } = require('../controller/users.controller');

const usersRouter = express.Router();

usersRouter.get('/:id', catchError(usersController.getById));
usersRouter.get('/', catchError(usersController.getAllUsers));
usersRouter.post('/', catchError(usersController.createUser));

module.exports = {
  usersRouter,
};
