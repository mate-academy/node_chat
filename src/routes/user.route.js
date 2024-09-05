const express = require('express');
const { createUser } = require('../controllers/user.controller');
const { catchError } = require('../utils/catchError');

const userRouter = new express.Router();

userRouter.post('/user', catchError(createUser));

module.exports = {
  userRouter,
};
