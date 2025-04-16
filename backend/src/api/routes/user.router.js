const { Router } = require('express');
const { catchError } = require('../../utils/catchError');
const { findOrCreateUser } = require('../controllers/user.controller');

const userRouter = Router();

userRouter.post('/', catchError(findOrCreateUser));

module.exports = userRouter;
