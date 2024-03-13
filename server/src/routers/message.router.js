import express from 'express';
import * as messageController from '../controllers/message.controller.js';
import { catchError } from '../middlewares/catchError.js';

export const router = express.Router();

router.get('/:roomId', catchError(messageController.getAllByRoom));

router.post('/', catchError(messageController.post));
