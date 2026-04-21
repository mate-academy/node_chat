'use strict';

const { Router } = require('express');
const { usersController } = require('../controllers/users.controller');

const usersRouter = Router();

// Маршрут для логіну/реєстрації
usersRouter.post('/login', usersController.login);

// Маршрут для отримання списку (може знадобитися в майбутньому)
usersRouter.get('/users', usersController.getAll);

module.exports = { usersRouter };
