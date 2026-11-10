const { Router } = require('express');
const { createUser } = require('../controllers/userController');

const userRouter = Router();

userRouter.post('/', createUser);

module.exports = {
  userRouter,
};
