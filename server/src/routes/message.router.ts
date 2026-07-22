import { randomUUID } from 'node:crypto';
import { messages, rooms } from '../store/store.js';
import type { Message } from '../utils/types/types.js';
import express, { Router, type Request, type Response } from 'express';
import EventEmitter from 'node:events';
import { authMiddleware } from '../middleware/auth.middleware.js';

interface MessageEvents {
  createMessage: [message: Message];
}

export const messageRouter: Router = express.Router();

export const messageEmitter = new EventEmitter<MessageEvents>();

messageRouter.get(
  '/',
  authMiddleware,
  (req: Request<{}, {}, {}, { roomId?: string }>, res: Response) => {
    const { roomId } = req.query;

    const userId = res.locals.user.id;

    if (!roomId) {
      return res.sendStatus(400);
    }

    const foundRoom = rooms.find((item) => item.id === roomId);

    if (!foundRoom) {
      return res.sendStatus(404);
    }

    const accessInRoom =
      foundRoom.usersId.some((id) => id === userId) ||
      foundRoom.ownerId === userId;

    if (!accessInRoom) {
      return res.sendStatus(401);
    }

    const messagesInRoom = messages.filter((message) => {
      return roomId === message.roomId;
    });

    res.send(messagesInRoom);
  },
);

messageRouter.post(
  '/',
  authMiddleware,
  (
    req: Request<{}, {}, { roomId?: string; text?: string }, {}>,
    res: Response,
  ) => {
    const { roomId, text } = req.body;

    const userId = res.locals.user.id;

    if (!roomId || !text) {
      return res.sendStatus(400);
    }

    const foundRoom = rooms.find((item) => item.id === roomId);

    if (!foundRoom) {
      return res.sendStatus(404);
    }

    const accessInRoom =
      foundRoom.usersId.some((id) => id === userId) ||
      foundRoom.ownerId === userId;

    if (!accessInRoom) {
      return res.sendStatus(401);
    }

    const newMessage: Message = {
      id: randomUUID().toString(),
      text,
      userId: res.locals.user.id,
      username: res.locals.user.username,
      time: new Date(),
      roomId,
    };

    messageEmitter.emit('createMessage', newMessage);
    messages.push(newMessage);

    res.send(200);
  },
);
