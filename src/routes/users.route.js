const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const Router = require('express').Router;
const { catchError } = require('../utils/catchError');

const userRoute = Router();

userRoute.get('/', authMiddleware, catchError(userController.getAll));

module.exports = { userRoute };
