import express from 'express';
import * as roomController from '../controllers/room.controller.js';
import { catchError } from '../middlewares/catchError.js';

export const router = express.Router();

router.get('/', catchError(roomController.getAll));

router.post('/',catchError(roomController.post));

router.patch('/:id', catchError(roomController.patch));

router.delete('/:id', catchError(roomController.remove));
