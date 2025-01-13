import express from 'express';
import * as messageController from '../controllers/message.controller.js';
import { catchError } from '../utils/catchError.js';

const router = express.Router();

router.get('/message/:id', catchError(messageController.get));

router.post('/message', express.json(), catchError(messageController.create));

export { router };
