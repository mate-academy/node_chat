const express = require('express');
const userController = require('../controllers/user.controller');
const catchError = require('../middlewares/catchError');

const userRouter = express.Router();

userRouter.post('/register', catchError(userController.registerUser));
userRouter.post('/login', catchError(userController.loginUser));
userRouter.get('/find/:userId', catchError(userController.findUser));
userRouter.get('/', catchError(userController.getUsers));

module.exports = userRouter;
