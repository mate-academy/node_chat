import express from 'express';
import { messagesController } from '../controllers/messages.controller.js';

export const messagesRoute = express.Router();

messagesRoute.post('/', messagesController.sendMessage);
