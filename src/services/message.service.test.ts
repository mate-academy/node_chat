import { describe, it, expect, vi, beforeEach } from 'vitest';
import { messageService } from './message.service.js';
import { prisma } from '../lib/prisma.js';
import type { Message, Room } from '../generated/prisma/client.js';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    message: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

type TransactionClient = Parameters<typeof prisma.$transaction>[0] extends (
  tx: infer T,
) => unknown
  ? T
  : never;

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'message-1',
    content: 'Hello',
    userId: 'user-1',
    roomId: 'room-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    name: 'Room',
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date(),
    ...overrides,
  };
}

describe('messageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllByRoomId', () => {
    it('returns hasMore: false and no nextCursor when results fit within the limit', async () => {
      const messages = [makeMessage({ id: 'm-1' }), makeMessage({ id: 'm-2' })];
      vi.mocked(prisma.message.findMany).mockResolvedValue(messages);

      const result = await messageService.getAllByRoomId(
        'room-1',
        undefined,
        20,
      );

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 21,
      });
      expect(result).toEqual({
        data: messages,
        hasMore: false,
        nextCursor: null,
      });
    });

    it('drops the extra row and returns hasMore: true with nextCursor pointing at the last visible item', async () => {
      const messages = [
        makeMessage({ id: 'm-1' }),
        makeMessage({ id: 'm-2' }),
        makeMessage({ id: 'm-3' }), // the "limit + 1"th row, signals there's more
      ];
      vi.mocked(prisma.message.findMany).mockResolvedValue(messages);

      const result = await messageService.getAllByRoomId(
        'room-1',
        undefined,
        2,
      );

      expect(result.data).toEqual([
        makeMessage({ id: 'm-1' }),
        makeMessage({ id: 'm-2' }),
      ]);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('m-2');
    });

    it('passes cursor-based pagination params through to prisma when a cursor is given', async () => {
      vi.mocked(prisma.message.findMany).mockResolvedValue([]);

      await messageService.getAllByRoomId('room-1', 'm-5', 10);

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { roomId: 'room-1' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 11,
        cursor: { id: 'm-5' },
        skip: 1,
      });
    });
  });

  describe('getOneById', () => {
    it('returns the message when found', async () => {
      const message = makeMessage();
      vi.mocked(prisma.message.findUnique).mockResolvedValue(message);

      expect(await messageService.getOneById('message-1')).toEqual(message);
    });

    it('returns null when the message does not exist', async () => {
      vi.mocked(prisma.message.findUnique).mockResolvedValue(null);

      expect(await messageService.getOneById('missing')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates the message and bumps the room lastActivityAt, in one transaction', async () => {
      const createdMessage = makeMessage();
      const tx = {
        message: {
          create: vi
            .fn<TransactionClient['message']['create']>()
            .mockResolvedValue(createdMessage),
        },
        room: {
          update: vi
            .fn<TransactionClient['room']['update']>()
            .mockResolvedValue(makeRoom()),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb) =>
        cb(tx as unknown as TransactionClient),
      );

      const result = await messageService.create({
        content: 'Hello',
        userId: 'user-1',
        roomId: 'room-1',
      });

      expect(result).toEqual(createdMessage);
      expect(tx.message.create).toHaveBeenCalledWith({
        data: { content: 'Hello', userId: 'user-1', roomId: 'room-1' },
      });
      expect(tx.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { lastActivityAt: expect.any(Date) },
      });
    });

    it('bumps the correct room even when it differs from the eventual message row', async () => {
      const tx = {
        message: {
          create: vi
            .fn<TransactionClient['message']['create']>()
            .mockResolvedValue(makeMessage({ roomId: 'room-42' })),
        },
        room: {
          update: vi
            .fn<TransactionClient['room']['update']>()
            .mockResolvedValue(makeRoom({ id: 'room-42' })),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb) =>
        cb(tx as unknown as TransactionClient),
      );

      await messageService.create({
        content: 'Hi',
        userId: 'user-1',
        roomId: 'room-42',
      });

      expect(tx.room.update).toHaveBeenCalledWith({
        where: { id: 'room-42' },
        data: { lastActivityAt: expect.any(Date) },
      });
    });
  });

  describe('delete', () => {
    it('deletes the message by id', async () => {
      vi.mocked(prisma.message.delete).mockResolvedValue(makeMessage());

      await messageService.delete('message-1');

      expect(prisma.message.delete).toHaveBeenCalledWith({
        where: { id: 'message-1' },
      });
    });
  });

  describe('update', () => {
    it('updates the message content and returns the updated row', async () => {
      const updatedMessage = makeMessage({ content: 'Edited' });
      vi.mocked(prisma.message.update).mockResolvedValue(updatedMessage);

      const result = await messageService.update('message-1', {
        content: 'Edited',
        userId: 'user-1',
        roomId: 'room-1',
      });

      expect(prisma.message.update).toHaveBeenCalledWith({
        where: { id: 'message-1' },
        data: { content: 'Edited', userId: 'user-1', roomId: 'room-1' },
      });
      expect(result).toEqual(updatedMessage);
    });
  });
});
