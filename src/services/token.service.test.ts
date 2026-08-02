import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tokenService } from './token.service.js';
import { prisma } from '../lib/prisma.js';
import type { Token } from '../generated/prisma/client.js';
import { TokenTypes } from '../generated/prisma/enums.js';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    token: {
      create: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

function makeToken(overrides: Partial<Token> = {}): Token {
  return {
    id: 'token-1',
    tokenHash: 'a'.repeat(64),
    userId: 'user-1',
    expiredTime: new Date(Date.now() + 1000 * 60 * 60),
    type: TokenTypes.ACTIVATION,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('tokenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates an ACTIVATION token with ~24h expiration and returns a raw hex token', async () => {
      const before = Date.now();
      const rawToken = await tokenService.create({
        userId: 'user-1',
        type: TokenTypes.ACTIVATION,
      });
      const after = Date.now();

      expect(rawToken).toMatch(/^[0-9a-f]{64}$/);

      expect(prisma.token.create).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(prisma.token.create).mock.calls[0]![0];

      expect(callArgs.data.userId).toBe('user-1');
      expect(callArgs.data.type).toBe(TokenTypes.ACTIVATION);
      expect(callArgs.data.tokenHash).toMatch(/^[0-9a-f]{64}$/);

      expect(callArgs.data.tokenHash).not.toBe(rawToken);

      const expiredTime = (callArgs.data.expiredTime as Date).getTime();
      expect(expiredTime).toBeGreaterThanOrEqual(
        before + 24 * 60 * 60 * 1000 - 1000,
      );
      expect(expiredTime).toBeLessThanOrEqual(
        after + 24 * 60 * 60 * 1000 + 1000,
      );
    });

    it('creates a RESET token with ~30min expiration', async () => {
      const before = Date.now();
      await tokenService.create({ userId: 'user-1', type: TokenTypes.RESET });
      const after = Date.now();

      const callArgs = vi.mocked(prisma.token.create).mock.calls[0]![0];
      const expiredTime = (callArgs.data.expiredTime as Date).getTime();

      expect(expiredTime).toBeGreaterThanOrEqual(
        before + 30 * 60 * 1000 - 1000,
      );
      expect(expiredTime).toBeLessThanOrEqual(after + 30 * 60 * 1000 + 1000);
    });
  });

  describe('verify', () => {
    it('returns null when no token matches the hash', async () => {
      vi.mocked(prisma.token.findUnique).mockResolvedValue(null);

      const result = await tokenService.verify(
        'some-raw-token',
        TokenTypes.ACTIVATION,
      );

      expect(result).toBeNull();
    });

    it('returns null when the token exists but has a different type', async () => {
      vi.mocked(prisma.token.findUnique).mockResolvedValue(
        makeToken({
          type: TokenTypes.RESET,
          expiredTime: new Date(Date.now() + 60_000),
        }),
      );

      const result = await tokenService.verify(
        'some-raw-token',
        TokenTypes.ACTIVATION,
      );

      expect(result).toBeNull();
    });

    it('returns "expired" when the token is found but past its expiredTime', async () => {
      vi.mocked(prisma.token.findUnique).mockResolvedValue(
        makeToken({ expiredTime: new Date(Date.now() - 1000) }),
      );

      const result = await tokenService.verify(
        'some-raw-token',
        TokenTypes.ACTIVATION,
      );

      expect(result).toBe('expired');
    });

    it('returns the token record when it is valid and not expired', async () => {
      const token = makeToken({
        expiredTime: new Date(Date.now() + 1000 * 60 * 60),
      });
      vi.mocked(prisma.token.findUnique).mockResolvedValue(token);

      const result = await tokenService.verify(
        'some-raw-token',
        TokenTypes.ACTIVATION,
      );

      expect(result).toEqual(token);
    });
  });

  describe('reissue', () => {
    it('upserts a token keyed by userId and type, replacing any existing one', async () => {
      vi.mocked(prisma.token.upsert).mockResolvedValue(makeToken());

      await tokenService.reissue({
        userId: 'user-1',
        type: TokenTypes.ACTIVATION,
      });

      expect(prisma.token.upsert).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(prisma.token.upsert).mock.calls[0]![0];

      expect(callArgs.where).toEqual({
        userId_type: { userId: 'user-1', type: TokenTypes.ACTIVATION },
      });
      expect(callArgs.update.tokenHash).toMatch(/^[0-9a-f]{64}$/);
      expect(callArgs.create.userId).toBe('user-1');
      expect(callArgs.create.type).toBe(TokenTypes.ACTIVATION);
    });
  });
});
