const express = require('express');
const { userController } = require('../controller/user.controller');

const userRouter = new express.Router();

userRouter.post('/registration', userController.register);
userRouter.post('/login', userController.login);
userRouter.delete('/deletion/:id', userController.deleteUser);
userRouter.get('/getName/:id', userController.getNameById);

module.exports = { userRouter };
