'use strict';
import express from 'express';
import { messagesController } from '../controllers/message.controller.js';

export const messageRouter = new express.Router();

messageRouter.get('/:roomId/messages', messagesController.findAllMessages);
messageRouter.post('/:roomId/messages', messagesController.createMessage);
