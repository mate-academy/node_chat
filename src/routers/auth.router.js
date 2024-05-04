'use strict';

const express = require('express');
const authController = require('../controllers/auth.controller');
const { catchError } = require('../middlewares/catchError');

const authRouter = express.Router();

authRouter.post('/', catchError(authController.authorize));

module.exports = {
  authRouter,
};
