import express from 'express';
import { usernameController } from '../controllers/usernames.controller.js';

export const usernameRouter = new express.Router();

usernameRouter.post('/username', usernameController.createUser);
