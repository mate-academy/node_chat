import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const userRoute = new Router();

userRoute.post('/', userController.create);

module.exports = { userRoute };
