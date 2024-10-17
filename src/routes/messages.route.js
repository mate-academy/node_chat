import express from 'express';
import { getMessages, postMessage } from '../controllers/message.controller.js';
import { catchError } from '../catcherrors.js';

export const messagesRoute = express.Router();

messagesRoute.get('/', catchError(getMessages));
messagesRoute.post('/', catchError(postMessage));
