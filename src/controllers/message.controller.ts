import type { NextFunction, Request, Response } from 'express';
import { messageService } from '../services/message.service.js';
import * as z from 'zod';
import {
  assertIsAdminOrOwner,
  assertIsAuthor,
  assertIsMessage,
  assertIsMessageId,
  assertIsRoom,
  assertIsRoomId,
  assertIsUserInRoom,
  getAuthUser,
} from '../utils/checks.js';
import { messageEmitter } from '../lib/messageEmmiter.js';

const CreateMessageData = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(4000, 'Message content cannot exceed 4000 characters'),
  roomId: z.string(),
});

const UpdateMessageData = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(4000, 'Message content cannot exceed 4000 characters'),
});

export const messageController = {
  async getAllByRoomId(
    req: Request<
      { roomId: string },
      unknown,
      unknown,
      { cursor?: string; limit?: string }
    >,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { roomId } = req.params;

    assertIsRoomId(roomId);

    await assertIsRoom(roomId);
    await assertIsUserInRoom(id, roomId);

    const cursor = req.query.cursor;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const messages = await messageService.getAllByRoomId(roomId, cursor, limit);

    res.send(messages);
  },

  async getOneById(
    req: Request<{ messageId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { messageId } = req.params;

    assertIsMessageId(messageId);

    const message = await assertIsMessage(messageId);

    await assertIsUserInRoom(id, message.roomId);

    res.send(message);
  },

  async create(req: Request, res: Response, next: NextFunction) {
    const { id } = getAuthUser(req);
    const { messageData } = req.body;

    const verifiedData = {
      ...CreateMessageData.parse(messageData),
      userId: id,
    };

    await assertIsRoom(verifiedData.roomId);

    await assertIsUserInRoom(verifiedData.userId, verifiedData.roomId);

    const message = await messageService.create(verifiedData);

    messageEmitter.emit('message:created', message);

    res.status(201).send(message);
  },

  async delete(
    req: Request<{ messageId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { messageId } = req.params;

    assertIsMessageId(messageId);

    const message = await assertIsMessage(messageId);

    if (message.userId === id) {
      // The requester is the author — always allowed to delete their own message.
    } else if (message.userId === null) {
      // The original author's account was deleted; only a room admin/owner
      // can clean up the orphaned message, since assertIsAuthor would
      // otherwise forbid everyone (including moderators) forever.
      await assertIsAdminOrOwner(id, message.roomId);
    } else {
      assertIsAuthor(id, message.userId);
    }

    await messageService.delete(messageId);

    messageEmitter.emit('message:deleted', {
      messageId,
      roomId: message.roomId,
    });

    res.sendStatus(204);
  },

  async update(
    req: Request<{ messageId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { messageId } = req.params;
    const { messageData } = req.body;

    assertIsMessageId(messageId);

    const message = await assertIsMessage(messageId);

    assertIsAuthor(id, message.userId || '');

    await assertIsUserInRoom(id, message.roomId);

    const verifiedData = {
      ...UpdateMessageData.parse(messageData),
      userId: message.userId,
      roomId: message.roomId,
    };

    const updatedMessage = await messageService.update(messageId, verifiedData);

    messageEmitter.emit('message:updated', updatedMessage);

    res.send(updatedMessage);
  },
};
