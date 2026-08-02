import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { userService } from './user.service.js';
import { prisma } from '../lib/prisma.js';
import type { User } from '../generated/prisma/client.js';
import { TokenTypes } from '../generated/prisma/enums.js';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    token: {
      deleteMany: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

type TransactionClient = Parameters<typeof prisma.$transaction>[0] extends (
  tx: infer T,
) => unknown
  ? T
  : never;

type UserCreateArgs = Parameters<typeof prisma.user.create>[0];

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test',
    password: null,
    confirmedEmail: false,
    googleId: null,
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('hashes the password before saving it — the plain password is never persisted', async () => {
      vi.mocked(prisma.user.create).mockImplementation((async ({
        data,
      }: UserCreateArgs) =>
        makeUser({
          email: data.email,
          name: data.name,
          password: (data.password as string | null | undefined) ?? null,
        })) as unknown as typeof prisma.user.create);

      const user = await userService.create({
        email: 'test@example.com',
        name: 'Test',
        password: 'PlainPassword1',
      });

      expect(user.password).not.toBe('PlainPassword1');
      expect(
        await bcrypt.compare('PlainPassword1', user.password as string),
      ).toBe(true);
    });
  });

  describe('createFromGoogle', () => {
    it('creates a user with confirmedEmail=true and password=null', async () => {
      vi.mocked(prisma.user.create).mockImplementation((async ({
        data,
      }: UserCreateArgs) =>
        makeUser({
          email: data.email,
          name: data.name,
          googleId: (data.googleId as string | null | undefined) ?? null,
          confirmedEmail: Boolean(data.confirmedEmail),
          password: null,
        })) as unknown as typeof prisma.user.create);

      const user = await userService.createFromGoogle({
        email: 'test@example.com',
        name: 'Test',
        googleId: 'google-123',
      });

      expect(user.password).toBeNull();
      expect(user.confirmedEmail).toBe(true);
      expect(user.googleId).toBe('google-123');
    });
  });

  describe('verifyPassword', () => {
    it('returns true for a matching password', async () => {
      const hash = await bcrypt.hash('CorrectPass1', 10);
      const user = makeUser({ password: hash });

      expect(await userService.verifyPassword(user, 'CorrectPass1')).toBe(true);
    });

    it('returns false for a non-matching password', async () => {
      const hash = await bcrypt.hash('CorrectPass1', 10);
      const user = makeUser({ password: hash });

      expect(await userService.verifyPassword(user, 'WrongPass1')).toBe(false);
    });

    it('returns false without throwing for a Google account that has no password', async () => {
      const user = makeUser({ password: null });

      await expect(
        userService.verifyPassword(user, 'AnyPassword1'),
      ).resolves.toBe(false);
    });
  });

  describe('confirmEmail', () => {
    it('marks the user as confirmed and deletes the used token in a single transaction', async () => {
      const tx = {
        user: {
          update: vi
            .fn<TransactionClient['user']['update']>()
            .mockResolvedValue(makeUser({ confirmedEmail: true })),
        },
        token: { delete: vi.fn<TransactionClient['token']['delete']>() },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb) =>
        cb(tx as unknown as TransactionClient),
      );

      await userService.confirmEmail('user-1', 'token-1');

      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { confirmedEmail: true },
      });
      expect(tx.token.delete).toHaveBeenCalledWith({
        where: { id: 'token-1' },
      });
    });
  });

  describe('linkGoogleIdWithConfirmedEmail', () => {
    it('confirms the email, links the googleId, and clears leftover activation tokens', async () => {
      const tx = {
        user: {
          update: vi
            .fn<TransactionClient['user']['update']>()
            .mockResolvedValue(
              makeUser({ confirmedEmail: true, googleId: 'google-123' }),
            ),
        },
        token: {
          deleteMany: vi.fn<TransactionClient['token']['deleteMany']>(),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb) =>
        cb(tx as unknown as TransactionClient),
      );

      await userService.linkGoogleIdWithConfirmedEmail('user-1', 'google-123');

      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { confirmedEmail: true, googleId: 'google-123' },
      });
      expect(tx.token.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: TokenTypes.ACTIVATION },
      });
    });
  });

  describe('linkGoogleIdWithUnconfirmedEmail', () => {
    it('confirms the email, links the googleId, and clears leftover activation tokens', async () => {
      const tx = {
        user: {
          update: vi
            .fn<TransactionClient['user']['update']>()
            .mockResolvedValue(
              makeUser({ confirmedEmail: true, googleId: 'google-123' }),
            ),
        },
        token: {
          deleteMany: vi.fn<TransactionClient['token']['deleteMany']>(),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb) =>
        cb(tx as unknown as TransactionClient),
      );

      await userService.linkGoogleIdWithUnconfirmedEmail(
        'user-1',
        'google-123',
      );

      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { confirmedEmail: true, googleId: 'google-123', password: null },
      });
      expect(tx.token.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', type: TokenTypes.ACTIVATION },
      });
    });
  });

  describe('searchUsersByName', () => {
    it('returns an empty item list and a null cursor when nothing matches', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      const result = await userService.searchUsersByName('nomatch', {});

      expect(result).toEqual({ items: [], nextCursor: null });
    });

    it('returns users whose name partially matches the query', async () => {
      const matches = [
        { id: 'u1', name: 'Johnathan Doe' },
        { id: 'u2', name: 'John Smith' },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(matches as never);

      const result = await userService.searchUsersByName('John', {});

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'John', mode: 'insensitive' } },
        }),
      );
      expect(result.items).toEqual(matches);
    });

    it('matches names case-insensitively by passing mode: "insensitive" to Prisma', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { id: 'u1', name: 'ALICE WONDERLAND' },
      ] as never);

      await userService.searchUsersByName('alice', {});

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'alice', mode: 'insensitive' } },
        }),
      );
    });

    it('truncates the results to the requested limit and returns the next cursor', async () => {
      // Service requests limit + 1 rows to detect whether another page exists.
      const returnedFromDb = [
        { id: 'u1', name: 'User 1' },
        { id: 'u2', name: 'User 2' },
        { id: 'u3', name: 'User 3' },
        { id: 'u4', name: 'User 4' },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(
        returnedFromDb as never,
      );

      const result = await userService.searchUsersByName('User', {
        limit: 3,
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 4 }),
      );
      expect(result.items).toHaveLength(3);
      expect(result.items).toEqual(returnedFromDb.slice(0, 3));
      expect(result.nextCursor).toBe('u3');
    });

    it('does not report a next cursor when the result set fits within the limit', async () => {
      const returnedFromDb = [
        { id: 'u1', name: 'User 1' },
        { id: 'u2', name: 'User 2' },
      ];
      vi.mocked(prisma.user.findMany).mockResolvedValue(
        returnedFromDb as never,
      );

      const result = await userService.searchUsersByName('User', {
        limit: 5,
      });

      expect(result.items).toEqual(returnedFromDb);
      expect(result.nextCursor).toBeNull();
    });

    it('falls back to the default limit of 10 when none is provided', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      await userService.searchUsersByName('a', {});

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 11 }),
      );
    });

    it('paginates with skip: 1 and a cursor filter when a cursor is supplied', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      await userService.searchUsersByName('a', { cursor: 'u5', limit: 2 });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: 'u5' },
          take: 3,
        }),
      );
    });

    it('omits skip and cursor entirely when no cursor is supplied', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      await userService.searchUsersByName('a', {});

      const callArgs = vi.mocked(prisma.user.findMany).mock.calls[0]?.[0];
      expect(callArgs).not.toHaveProperty('skip');
      expect(callArgs).not.toHaveProperty('cursor');
    });

    it('orders results by id ascending for stable pagination', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);

      await userService.searchUsersByName('a', {});

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { id: 'asc' } }),
      );
    });

    it('requests only id and name from Prisma, keeping email, password, and googleId out of the result — the same field-hiding guarantee stabilizeUser provides in the controller', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        { id: 'u1', name: 'Alice' },
        { id: 'u2', name: 'Alicia' },
      ] as never);

      const result = await userService.searchUsersByName('Alic', {});

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: { id: true, name: true },
        }),
      );

      for (const item of result.items) {
        expect(item).not.toHaveProperty('email');
        expect(item).not.toHaveProperty('password');
        expect(item).not.toHaveProperty('googleId');
        expect(Object.keys(item).sort()).toEqual(['id', 'name']);
      }
    });
  });
});
