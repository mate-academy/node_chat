import express from 'express';
import { usernameController } from '../controllers/usernamesController.js';

export const usernameRouter = new express.Router();

usernameRouter.post('/username', usernameController.create);
