'use strict';

const express = require('express');
const directController = require('../controllers/direct.controller');
const { catchError } = require('../middlewares/catchError');

const directRouter = express.Router();

directRouter.post('/', catchError(directController.create));

directRouter.get('/:directId', catchError(directController.getDirectMessages));

directRouter.get('/user/:userId', catchError(directController.getUserDirects));

module.exports = { directRouter };
