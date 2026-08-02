import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { authMiddleware } from './auth.middleware.js';
import { jwtService } from '../utils/jwt.js';
import { userService } from '../services/user.service.js';
import { UnauthorizedError } from '../utils/checks.js';
import type { User } from '../generated/prisma/client.js';

vi.mock('../utils/jwt.js', () => ({
  jwtService: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock('../services/user.service.js', () => ({
  userService: {
    getOneById: vi.fn(),
  },
}));

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test',
    password: 'hashed',
    confirmedEmail: false,
    googleId: null,
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeReq(authorization?: string): Request {
  return {
    headers: authorization ? { authorization } : {},
  } as unknown as Request;
}

describe('authMiddleware', () => {
  const res = {} as Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  it('rejects with 401 when the Authorization header is missing', async () => {
    const req = makeReq();

    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      UnauthorizedError,
    );
    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      'Authorization header is missing or malformed',
    );

    expect(jwtService.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects with 401 when the Authorization header is malformed (no Bearer prefix)', async () => {
    const req = makeReq('Basic sometoken');

    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      UnauthorizedError,
    );
    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      'Authorization header is missing or malformed',
    );

    expect(jwtService.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects with 401 when the token has an invalid signature', async () => {
    const req = makeReq('Bearer bad.signature.token');
    vi.mocked(jwtService.verify).mockImplementation(() => {
      throw new JsonWebTokenError('invalid signature');
    });

    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      UnauthorizedError,
    );
    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      'Invalid or expired token',
    );

    expect(userService.getOneById).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects with 401 when the token is expired', async () => {
    const req = makeReq('Bearer expired.token.here');
    vi.mocked(jwtService.verify).mockImplementation(() => {
      throw new TokenExpiredError('jwt expired', new Date());
    });

    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      UnauthorizedError,
    );
    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      'Invalid or expired token',
    );

    expect(userService.getOneById).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects with 401 "Session revoked" when the token tokenVersion does not match the user record', async () => {
    const req = makeReq('Bearer valid.but.stale.token');
    vi.mocked(jwtService.verify).mockReturnValue({
      userId: 'user-1',
      tokenVersion: 1,
      sessionId: 'family-1',
    });
    vi.mocked(userService.getOneById).mockResolvedValue(
      makeUser({ id: 'user-1', tokenVersion: 2 }),
    );

    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      UnauthorizedError,
    );
    await expect(authMiddleware(req, res, next)).rejects.toThrow(
      'Session revoked',
    );

    expect(next).not.toHaveBeenCalled();
  });

  it('attaches req.user and calls next() when the token is valid and tokenVersion matches', async () => {
    const req = makeReq('Bearer valid.matching.token');
    vi.mocked(jwtService.verify).mockReturnValue({
      userId: 'user-1',
      tokenVersion: 3,
      sessionId: 'family-1',
    });
    const user = makeUser({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      tokenVersion: 3,
    });
    vi.mocked(userService.getOneById).mockResolvedValue(user);

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({ ...user, sessionId: 'family-1' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});
