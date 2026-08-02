import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { messageController } from './message.controller.js';
import { messageService } from '../services/message.service.js';
import { messageEmitter } from '../lib/messageEmmiter.js';
import {
  assertIsAdminOrOwner,
  assertIsAuthor,
  assertIsMessage,
  assertIsMessageId,
  assertIsRoom,
  assertIsRoomId,
  assertIsUserInRoom,
} from '../utils/checks.js';
import type { Message } from '../generated/prisma/client.js';

vi.mock('../services/message.service.js', () => ({
  messageService: {
    getAllByRoomId: vi.fn(),
    getOneById: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../lib/messageEmmiter.js', () => ({
  messageEmitter: {
    emit: vi.fn(),
  },
}));

vi.mock('../utils/checks.js', () => ({
  assertIsAdminOrOwner: vi.fn(),
  assertIsAuthor: vi.fn(),
  assertIsMessage: vi.fn(),
  assertIsMessageId: vi.fn(),
  assertIsRoom: vi.fn(),
  assertIsRoomId: vi.fn(),
  assertIsUserInRoom: vi.fn(),
  getAuthUser: vi.fn((req: Request) => req.user),
}));

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'message-1',
    content: 'hello',
    userId: 'user-1',
    roomId: 'room-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeReq<T = Request>(overrides: Record<string, unknown> = {}): T {
  return {
    body: {},
    headers: {},
    params: {},
    query: {},
    ...overrides,
  } as unknown as T;
}

function makeRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.sendStatus = vi.fn().mockReturnValue(res);
  return res;
}

describe('messageController', () => {
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  describe('create', () => {
    it('creates the message, emits message:created, and responds 201', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(undefined as never);
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      const message = makeMessage({ content: 'hello there' });
      vi.mocked(messageService.create).mockResolvedValue(message);

      const req = makeReq({
        user: { id: 'user-1' },
        body: {
          messageData: { content: 'hello there', roomId: 'room-1' },
        },
      });
      const res = makeRes();

      await messageController.create(req, res, next);

      expect(assertIsRoom).toHaveBeenCalledWith('room-1');
      expect(assertIsUserInRoom).toHaveBeenCalledWith('user-1', 'room-1');
      expect(messageService.create).toHaveBeenCalledWith({
        content: 'hello there',
        roomId: 'room-1',
        userId: 'user-1',
      });
      expect(messageEmitter.emit).toHaveBeenCalledWith(
        'message:created',
        message,
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(message);
    });

    it('does not create a message or emit when the user is not a member of the room', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(undefined as never);
      vi.mocked(assertIsUserInRoom).mockRejectedValue(
        new Error('User is not a member of this room'),
      );

      const req = makeReq({
        user: { id: 'user-1' },
        body: {
          messageData: { content: 'hello there', roomId: 'room-1' },
        },
      });
      const res = makeRes();

      await expect(messageController.create(req, res, next)).rejects.toThrow(
        'User is not a member of this room',
      );

      expect(messageService.create).not.toHaveBeenCalled();
      expect(messageEmitter.emit).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates the message, emits message:updated, and responds with the updated message', async () => {
      const message = makeMessage({
        id: 'message-1',
        userId: 'user-1',
        roomId: 'room-1',
      });
      vi.mocked(assertIsMessage).mockResolvedValue(message);
      vi.mocked(assertIsAuthor).mockReturnValue(undefined);
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      const updatedMessage = makeMessage({
        id: 'message-1',
        content: 'edited content',
        userId: 'user-1',
        roomId: 'room-1',
      });
      vi.mocked(messageService.update).mockResolvedValue(updatedMessage);

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'user-1' },
        params: { messageId: 'message-1' },
        body: { messageData: { content: 'edited content' } },
      });
      const res = makeRes();

      await messageController.update(req, res, next);

      expect(assertIsMessageId).toHaveBeenCalledWith('message-1');
      expect(assertIsMessage).toHaveBeenCalledWith('message-1');
      expect(assertIsAuthor).toHaveBeenCalledWith('user-1', 'user-1');
      expect(assertIsUserInRoom).toHaveBeenCalledWith('user-1', 'room-1');
      expect(messageService.update).toHaveBeenCalledWith('message-1', {
        content: 'edited content',
        userId: 'user-1',
        roomId: 'room-1',
      });
      expect(messageEmitter.emit).toHaveBeenCalledWith(
        'message:updated',
        updatedMessage,
      );
      expect(res.send).toHaveBeenCalledWith(updatedMessage);
    });

    it('falls back to an empty string for a null author when checking authorship', async () => {
      const message = makeMessage({
        id: 'message-1',
        userId: null,
        roomId: 'room-1',
      });
      vi.mocked(assertIsMessage).mockResolvedValue(message);
      vi.mocked(assertIsAuthor).mockImplementation(() => {
        throw new Error('Only the author can perform this action');
      });

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'user-1' },
        params: { messageId: 'message-1' },
        body: { messageData: { content: 'edited content' } },
      });
      const res = makeRes();

      await expect(messageController.update(req, res, next)).rejects.toThrow(
        'Only the author can perform this action',
      );

      expect(assertIsAuthor).toHaveBeenCalledWith('user-1', '');
      expect(assertIsUserInRoom).not.toHaveBeenCalled();
      expect(messageService.update).not.toHaveBeenCalled();
      expect(messageEmitter.emit).not.toHaveBeenCalled();
    });

    it('does not update or emit when the requester is not the author', async () => {
      const message = makeMessage({
        id: 'message-1',
        userId: 'other-user',
        roomId: 'room-1',
      });
      vi.mocked(assertIsMessage).mockResolvedValue(message);
      vi.mocked(assertIsAuthor).mockImplementation(() => {
        throw new Error('Only the author can perform this action');
      });

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'user-1' },
        params: { messageId: 'message-1' },
        body: { messageData: { content: 'edited content' } },
      });
      const res = makeRes();

      await expect(messageController.update(req, res, next)).rejects.toThrow(
        'Only the author can perform this action',
      );

      expect(messageService.update).not.toHaveBeenCalled();
      expect(messageEmitter.emit).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('lets the author delete their own message without an admin/owner check', async () => {
      const message = makeMessage({
        id: 'message-1',
        userId: 'user-1',
        roomId: 'room-1',
      });
      vi.mocked(assertIsMessage).mockResolvedValue(message);

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'user-1' },
        params: { messageId: 'message-1' },
      });
      const res = makeRes();

      await messageController.delete(req, res, next);

      expect(assertIsAuthor).not.toHaveBeenCalled();
      expect(assertIsAdminOrOwner).not.toHaveBeenCalled();
      expect(messageService.delete).toHaveBeenCalledWith('message-1');
      expect(messageEmitter.emit).toHaveBeenCalledWith('message:deleted', {
        messageId: 'message-1',
        roomId: 'room-1',
      });
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('requires assertIsAdminOrOwner (not assertIsAuthor) when the message author account was deleted', async () => {
      const message = makeMessage({
        id: 'message-1',
        userId: null,
        roomId: 'room-1',
      });
      vi.mocked(assertIsMessage).mockResolvedValue(message);
      vi.mocked(assertIsAdminOrOwner).mockResolvedValue(undefined);

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'admin-1' },
        params: { messageId: 'message-1' },
      });
      const res = makeRes();

      await messageController.delete(req, res, next);

      expect(assertIsAdminOrOwner).toHaveBeenCalledWith('admin-1', 'room-1');
      expect(assertIsAuthor).not.toHaveBeenCalled();
      expect(messageService.delete).toHaveBeenCalledWith('message-1');
      expect(messageEmitter.emit).toHaveBeenCalledWith('message:deleted', {
        messageId: 'message-1',
        roomId: 'room-1',
      });
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('blocks deletion of an orphaned message when the requester is not an admin or owner', async () => {
      const message = makeMessage({
        id: 'message-1',
        userId: null,
        roomId: 'room-1',
      });
      vi.mocked(assertIsMessage).mockResolvedValue(message);
      vi.mocked(assertIsAdminOrOwner).mockRejectedValue(
        new Error('Only room admins or the owner can perform this action'),
      );

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'member-1' },
        params: { messageId: 'message-1' },
      });
      const res = makeRes();

      await expect(messageController.delete(req, res, next)).rejects.toThrow(
        'Only room admins or the owner can perform this action',
      );

      expect(assertIsAuthor).not.toHaveBeenCalled();
      expect(messageService.delete).not.toHaveBeenCalled();
      expect(messageEmitter.emit).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it("applies assertIsAuthor (not assertIsAdminOrOwner) when deleting someone else's still-existing message", async () => {
      const message = makeMessage({
        id: 'message-1',
        userId: 'other-user',
        roomId: 'room-1',
      });
      vi.mocked(assertIsMessage).mockResolvedValue(message);
      vi.mocked(assertIsAuthor).mockReturnValue(undefined);

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'user-1' },
        params: { messageId: 'message-1' },
      });
      const res = makeRes();

      await messageController.delete(req, res, next);

      expect(assertIsAuthor).toHaveBeenCalledWith('user-1', 'other-user');
      expect(assertIsAdminOrOwner).not.toHaveBeenCalled();
      expect(messageService.delete).toHaveBeenCalledWith('message-1');
      expect(messageEmitter.emit).toHaveBeenCalledWith('message:deleted', {
        messageId: 'message-1',
        roomId: 'room-1',
      });
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('does not delete or emit when the requester is neither the author nor an admin/owner', async () => {
      const message = makeMessage({
        id: 'message-1',
        userId: 'other-user',
        roomId: 'room-1',
      });
      vi.mocked(assertIsMessage).mockResolvedValue(message);
      vi.mocked(assertIsAuthor).mockImplementation(() => {
        throw new Error('Only the author can perform this action');
      });

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'random-user' },
        params: { messageId: 'message-1' },
      });
      const res = makeRes();

      await expect(messageController.delete(req, res, next)).rejects.toThrow(
        'Only the author can perform this action',
      );

      expect(assertIsAdminOrOwner).not.toHaveBeenCalled();
      expect(messageService.delete).not.toHaveBeenCalled();
      expect(messageEmitter.emit).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
  });

  describe('getOneById', () => {
    it('returns the message when the requester belongs to its room', async () => {
      const message = makeMessage({ id: 'message-1', roomId: 'room-1' });
      vi.mocked(assertIsMessage).mockResolvedValue(message);
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'user-1' },
        params: { messageId: 'message-1' },
      });
      const res = makeRes();

      await messageController.getOneById(req, res, next);

      expect(assertIsMessageId).toHaveBeenCalledWith('message-1');
      expect(assertIsMessage).toHaveBeenCalledWith('message-1');
      expect(assertIsUserInRoom).toHaveBeenCalledWith('user-1', 'room-1');
      expect(res.send).toHaveBeenCalledWith(message);
    });

    it('propagates the error and never responds when the requester is not in the room', async () => {
      const message = makeMessage({ id: 'message-1', roomId: 'room-1' });
      vi.mocked(assertIsMessage).mockResolvedValue(message);
      vi.mocked(assertIsUserInRoom).mockRejectedValue(
        new Error('User is not a member of this room'),
      );

      const req = makeReq<Request<{ messageId: string }>>({
        user: { id: 'user-1' },
        params: { messageId: 'message-1' },
      });
      const res = makeRes();

      await expect(
        messageController.getOneById(req, res, next),
      ).rejects.toThrow('User is not a member of this room');

      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('getAllByRoomId', () => {
    it('returns the paginated messages for the room, defaulting the limit to 20', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(undefined as never);
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      const result = {
        data: [makeMessage()],
        hasMore: false,
        nextCursor: null,
      };
      vi.mocked(messageService.getAllByRoomId).mockResolvedValue(result);

      const req = makeReq<
        Request<
          { roomId: string },
          unknown,
          unknown,
          { cursor?: string; limit?: string }
        >
      >({
        user: { id: 'user-1' },
        params: { roomId: 'room-1' },
        query: {},
      });
      const res = makeRes();

      await messageController.getAllByRoomId(req, res, next);

      expect(assertIsRoomId).toHaveBeenCalledWith('room-1');
      expect(assertIsRoom).toHaveBeenCalledWith('room-1');
      expect(assertIsUserInRoom).toHaveBeenCalledWith('user-1', 'room-1');
      expect(messageService.getAllByRoomId).toHaveBeenCalledWith(
        'room-1',
        undefined,
        20,
      );
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('forwards the cursor and a custom limit when provided', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(undefined as never);
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      const result = { data: [], hasMore: false, nextCursor: null };
      vi.mocked(messageService.getAllByRoomId).mockResolvedValue(result);

      const req = makeReq<
        Request<
          { roomId: string },
          unknown,
          unknown,
          { cursor?: string; limit?: string }
        >
      >({
        user: { id: 'user-1' },
        params: { roomId: 'room-1' },
        query: { cursor: 'message-50', limit: '5' },
      });
      const res = makeRes();

      await messageController.getAllByRoomId(req, res, next);

      expect(messageService.getAllByRoomId).toHaveBeenCalledWith(
        'room-1',
        'message-50',
        5,
      );
    });

    it('caps the limit at 100 even when a larger value is requested', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(undefined as never);
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      const result = { data: [], hasMore: false, nextCursor: null };
      vi.mocked(messageService.getAllByRoomId).mockResolvedValue(result);

      const req = makeReq<
        Request<
          { roomId: string },
          unknown,
          unknown,
          { cursor?: string; limit?: string }
        >
      >({
        user: { id: 'user-1' },
        params: { roomId: 'room-1' },
        query: { limit: '500' },
      });
      const res = makeRes();

      await messageController.getAllByRoomId(req, res, next);

      expect(messageService.getAllByRoomId).toHaveBeenCalledWith(
        'room-1',
        undefined,
        100,
      );
    });
  });
});
