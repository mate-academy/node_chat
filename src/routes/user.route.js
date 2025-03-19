const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { catchError } = require('../utils/catchError.js');

const userRouter = new express.Router();

userRouter.post('/', catchError(userController.create));
userRouter.get('/:id', catchError(userController.getOne));

module.exports = { userRouter };
