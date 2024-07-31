const express = require('express');
const { userController } = require('../controllers/user.controller.js');
const { Utils } = require('../utils/utils.js');

const userRouter = express.Router();

userRouter.post('/login', Utils.catchError(userController.login));
userRouter.post('/logout', Utils.catchError(userController.logout));

module.exports = { userRouter };
