const express = require('express');

const {
  controller: userController,
} = require('../controllers/users.controller');
const { catchError } = require('../utils/catchError');

const router = express.Router();

router.get('/', (req, res) => catchError(userController.getAll));

router.get('/:id', (req, res) => catchError(userController.getById));

module.exports = { router };
