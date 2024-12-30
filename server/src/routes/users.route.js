const express = require('express');

const { usersControllers } = require('../controllers/users.controller');

const router = express.Router();

router.get('/', usersControllers.getUsers);
router.get('/:id', usersControllers.getUserById);
router.post('/signup', usersControllers.signup);
router.post('/signin', usersControllers.signIn);

module.exports = { usersRouter: router };
