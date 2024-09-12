/* eslint-disable no-console */
import express from 'express';
import { messagesController } from '../controllers/messages.controller.js';

export const messagesRouter = new express.Router();

messagesRouter.post('/', messagesController.create);
