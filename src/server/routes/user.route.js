const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { catchError } = require('../utils/catchError.js');
const { errorMiddleWare } = require('../middlewares/errorMiddleWare.js');

const userRouter = new express.Router();

userRouter.get('/', errorMiddleWare, catchError(userController.get));
userRouter.post('/', errorMiddleWare, catchError(userController.create));

module.exports = { userRouter };
