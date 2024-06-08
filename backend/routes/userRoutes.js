const express = require('express');
const { userController: user }= require('../controllers/user.controller');
const checkUserName = require('../middleware/checkUserName');
const { middlewareErrorHandler } = require('../middleware/middlewareErrorHandler.js');

const userRoutes = new express.Router();

userRoutes.get('/:userId', middlewareErrorHandler(user.getOneUser))

userRoutes.post(
  '/register',
  middlewareErrorHandler(checkUserName),
  middlewareErrorHandler(user.registerUser)
);

userRoutes.delete(
  '/delete/:userId',
  middlewareErrorHandler(user.deleteUser)
);

module.exports = userRoutes;
