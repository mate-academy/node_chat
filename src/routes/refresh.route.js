import express from 'express';
import { catchError } from '../utils/catchError.js';
import { refreshController } from '../controllers/refresh.controller.js';

export const refreshRouter = new express.Router();

refreshRouter.get('/', catchError(refreshController.refresh));
