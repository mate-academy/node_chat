'use strict';

const express = require('express');
const { userController } = require('../controllers/userController.js');
const { catchErrorMW } = require('../middlewares/catchErrorMW.js');

const userRouter = new express.Router();

userRouter.post('/login', catchErrorMW(userController.login));
userRouter.get('/users', catchErrorMW(userController.getAllNames));

module.exports = { userRouter };
