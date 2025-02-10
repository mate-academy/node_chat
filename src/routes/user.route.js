const { Router } = require('express');
const userController = require('../controllers/user.controller');

const userRoute = new Router();

userRoute.post('/', userController.create);

module.exports = {
  userRoute,
};
