const express = require('express');

const {
  controller: userController,
} = require('../controllers/user.controller');
const { catchError } = require('../utils/catchError');

const router = express.Router();

router.get('/', catchError(userController.getAll));

router.get('/:id', catchError(userController.getById));

module.exports = { router };
