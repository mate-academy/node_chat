import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { userController } from './user.controller.js';
import { refreshTokenService } from '../services/refreshToken.service.js';
import { jwtService } from '../utils/jwt.js';
import { userService } from '../services/user.service.js';
import { tokenService } from '../services/token.service.js';
import { mailer } from '../utils/email.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { disconnectUserSockets } from '../lib/socket.js';
import {
  assertIsCorrectEmailAndPassword,
  assertIsConfirmedEmail,
  assertIsValidRefreshToken,
  assertIsUser,
  assertIsValidToken,
  assertIsValidGoogleToken,
  assertIsEmailVerified,
  assertIsCorrectPassword,
  assertIsUniqueEmail,
  assertHasNoOwnedRooms,
} from '../utils/checks.js';
import type { User } from '../generated/prisma/client.js';

// --- Mocks for the services/helpers the controller talks to ---
vi.mock('../services/refreshToken.service.js', () => ({
  refreshTokenService: {
    create: vi.fn(),
    verifyAndRotate: vi.fn(),
    findByRawToken: vi.fn(),
    revoke: vi.fn(),
    revokeAllForUser: vi.fn(),
    listSessions: vi.fn(),
  },
}));

vi.mock('../utils/jwt.js', () => ({
  jwtService: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock('../services/user.service.js', () => ({
  userService: {
    getOneById: vi.fn(),
    getOneByEmail: vi.fn(),
    getOneByGoogleId: vi.fn(),
    incrementTokenVersion: vi.fn(),
    updatePassword: vi.fn(),
    confirmEmail: vi.fn(),
    linkGoogleIdWithUnconfirmedEmail: vi.fn(),
    linkGoogleIdWithConfirmedEmail: vi.fn(),
    createFromGoogle: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../utils/checks.js', () => ({
  assertIsCorrectEmailAndPassword: vi.fn(),
  assertIsConfirmedEmail: vi.fn(),
  assertIsValidRefreshToken: vi.fn(),
  assertIsUser: vi.fn(),
  assertIsValidToken: vi.fn(),
  assertIsValidGoogleToken: vi.fn(),
  assertIsEmailVerified: vi.fn(),
  getAuthUser: vi.fn((req: Request) => req.user),
  assertIsCorrectPassword: vi.fn(),
  assertIsUniqueEmail: vi.fn(),
  assertHasNoOwnedRooms: vi.fn(),
}));

vi.mock('../services/token.service.js', () => ({
  tokenService: {
    create: vi.fn(),
    reissue: vi.fn(),
    invalidate: vi.fn(),
  },
}));

vi.mock('../utils/email.js', () => ({
  mailer: {
    sendResetPasswordEmail: vi.fn(),
    sendActivationEmail: vi.fn(),
    sendSafely: vi.fn((sendFn) => sendFn()),
  },
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock('../lib/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../lib/socket.js', () => ({
  disconnectUserSockets: vi.fn(),
}));

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    password: 'hashed',
    confirmedEmail: true,
    googleId: null,
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeReq<T = Request>(overrides: Record<string, unknown> = {}): T {
  return {
    body: {},
    headers: {},
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

describe('userController', () => {
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  describe('register', () => {
    it('registers the user, creates an activation token, and emails it', async () => {
      const createdUser = makeUser({
        id: 'user-1',
        email: 'user@example.com',
        confirmedEmail: false,
      });
      vi.mocked(assertIsUniqueEmail).mockResolvedValue(undefined as never);
      vi.mocked(userService.create).mockResolvedValue(createdUser);
      vi.mocked(tokenService.create).mockResolvedValue('raw-activation-token');

      const req = makeReq({
        body: {
          registerData: {
            email: 'user@example.com',
            name: 'Test User',
            password: 'Password1',
          },
        },
      });
      const res = makeRes();

      await userController.register(req, res, next);

      expect(userService.create).toHaveBeenCalledWith({
        email: 'user@example.com',
        name: 'Test User',
        password: 'Password1',
      });
      expect(mailer.sendActivationEmail).toHaveBeenCalledWith(
        'user@example.com',
        'raw-activation-token',
      );
      expect(res.status).toHaveBeenCalledWith(201);
      const sent = vi.mocked(res.send).mock.calls[0]?.[0];
      expect(sent).not.toHaveProperty('password');
    });

    // Regression test: without normalizing the email, "User@Example.com" and
    // "user@example.com" would be treated as two different accounts (the
    // uniqueness check and the stored record would silently diverge from
    // what the user typed elsewhere, e.g. at login).
    it('normalizes the email to lowercase and trimmed before checking uniqueness and creating the user', async () => {
      const createdUser = makeUser({
        id: 'user-1',
        email: 'user@example.com',
      });
      vi.mocked(assertIsUniqueEmail).mockResolvedValue(undefined as never);
      vi.mocked(userService.create).mockResolvedValue(createdUser);
      vi.mocked(tokenService.create).mockResolvedValue('raw-activation-token');

      const req = makeReq({
        body: {
          registerData: {
            email: '  User@Example.com  ',
            name: 'Test User',
            password: 'Password1',
          },
        },
      });
      const res = makeRes();

      await userController.register(req, res, next);

      expect(assertIsUniqueEmail).toHaveBeenCalledWith('user@example.com');
      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@example.com' }),
      );
      expect(mailer.sendActivationEmail).toHaveBeenCalledWith(
        'user@example.com',
        'raw-activation-token',
      );
    });
  });

  describe('getMe', () => {
    it('returns the authenticated user from req.user without a password field', async () => {
      const user = makeUser({ id: 'user-1' });
      const req = makeReq({ user: { ...user, sessionId: 'session-1' } });
      const res = makeRes();

      await userController.getMe(req, res, next);

      expect(userService.getOneById).not.toHaveBeenCalled();
      expect(assertIsUser).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      const sent = vi.mocked(res.send).mock.calls[0]?.[0];
      expect(sent).not.toHaveProperty('password');
      expect(sent).toMatchObject({ id: 'user-1', email: user.email });
    });
  });

  describe('update', () => {
    it('updates the user without re-fetching it when the email is unchanged', async () => {
      const currentUser = makeUser({ id: 'user-1', email: 'same@example.com' });
      const req = makeReq({
        user: { ...currentUser, sessionId: 'session-1' },
        body: {
          userData: { name: 'New Name', email: 'same@example.com' },
        },
      });
      const res = makeRes();
      const updatedUser = makeUser({
        id: 'user-1',
        name: 'New Name',
        email: 'same@example.com',
      });
      vi.mocked(userService.update).mockResolvedValue(updatedUser);

      await userController.update(req, res, next);

      expect(assertIsUser).not.toHaveBeenCalled();
      expect(userService.update).toHaveBeenCalledWith('user-1', {
        name: 'New Name',
        email: 'same@example.com',
      });
      expect(mailer.sendActivationEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('reissues the activation token and sends it when the email changes', async () => {
      const currentUser = makeUser({ id: 'user-1', email: 'old@example.com' });
      const req = makeReq({
        user: { ...currentUser, sessionId: 'session-1' },
        body: {
          userData: { name: 'Test User', email: 'new@example.com' },
        },
      });
      const res = makeRes();
      const updatedUser = makeUser({
        id: 'user-1',
        email: 'new@example.com',
        confirmedEmail: false,
      });
      vi.mocked(userService.update).mockResolvedValue(updatedUser);
      vi.mocked(tokenService.reissue).mockResolvedValue('raw-activation-token');

      await userController.update(req, res, next);

      expect(userService.update).toHaveBeenCalledWith('user-1', {
        name: 'Test User',
        email: 'new@example.com',
        confirmedEmail: false,
      });
      expect(tokenService.reissue).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'ACTIVATION',
      });
      expect(mailer.sendActivationEmail).toHaveBeenCalledWith(
        'new@example.com',
        'raw-activation-token',
      );
    });

    // Regression test: comparing the raw (non-normalized) input against
    // currentUser.email would treat "USER@Example.com" as a changed email
    // even when it's the same address as stored, wrongly forcing
    // re-confirmation and firing an activation email.
    it('does not treat a case/whitespace variant of the current email as a change', async () => {
      const currentUser = makeUser({ id: 'user-1', email: 'same@example.com' });
      const req = makeReq({
        user: { ...currentUser, sessionId: 'session-1' },
        body: {
          userData: { name: 'New Name', email: '  Same@Example.com  ' },
        },
      });
      const res = makeRes();
      const updatedUser = makeUser({
        id: 'user-1',
        name: 'New Name',
        email: 'same@example.com',
      });
      vi.mocked(userService.update).mockResolvedValue(updatedUser);

      await userController.update(req, res, next);

      expect(assertIsUniqueEmail).not.toHaveBeenCalled();
      expect(userService.update).toHaveBeenCalledWith('user-1', {
        name: 'New Name',
        email: 'same@example.com',
      });
      expect(mailer.sendActivationEmail).not.toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('updates the password and revokes sessions when the current password is correct', async () => {
      const user = makeUser({ id: 'user-1' });
      const authUser = { ...user, sessionId: 'session-1' };
      const req = makeReq({
        user: authUser,
        body: {
          passwordData: {
            currentPassword: 'OldPass1',
            newPassword: 'NewPass1',
          },
        },
      });
      const res = makeRes();
      vi.mocked(assertIsCorrectPassword).mockResolvedValue(undefined);
      vi.mocked(prisma.$transaction).mockImplementation(async (fn) =>
        fn({} as never),
      );

      await userController.updatePassword(req, res, next);

      expect(assertIsUser).not.toHaveBeenCalled();
      expect(assertIsCorrectPassword).toHaveBeenCalledWith(
        authUser,
        'OldPass1',
      );
      expect(userService.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'NewPass1',
        {},
      );
      expect(refreshTokenService.revokeAllForUser).toHaveBeenCalledWith(
        'user-1',
        {},
      );
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('propagates the error and never touches the password when the current password is wrong', async () => {
      const user = makeUser({ id: 'user-1' });
      const req = makeReq({
        user: { ...user, sessionId: 'session-1' },
        body: {
          passwordData: {
            currentPassword: 'WrongPass1',
            newPassword: 'NewPass1',
          },
        },
      });
      const res = makeRes();
      vi.mocked(assertIsCorrectPassword).mockRejectedValue(
        new Error('Incorrect password'),
      );

      await expect(
        userController.updatePassword(req, res, next),
      ).rejects.toThrow('Incorrect password');

      expect(userService.updatePassword).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the user when they own no rooms', async () => {
      const user = makeUser({ id: 'user-1' });
      const req = makeReq({ user: { ...user, sessionId: 'session-1' } });
      const res = makeRes();
      vi.mocked(assertHasNoOwnedRooms).mockResolvedValue(undefined);

      await userController.delete(req, res, next);

      expect(assertIsUser).not.toHaveBeenCalled();
      expect(assertHasNoOwnedRooms).toHaveBeenCalledWith('user-1', {});
      expect(userService.delete).toHaveBeenCalledWith('user-1', {});
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    // Regression test: previously delete() did not disconnect the deleted
    // user's active sockets (unlike logoutAll/updatePassword/
    // confirmPasswordReset), so an already-open connection stayed alive
    // until it naturally dropped.
    it('disconnects the deleted user’s active sockets', async () => {
      const user = makeUser({ id: 'user-1' });
      const req = makeReq({ user: { ...user, sessionId: 'session-1' } });
      const res = makeRes();
      vi.mocked(assertHasNoOwnedRooms).mockResolvedValue(undefined);

      await userController.delete(req, res, next);

      expect(disconnectUserSockets).toHaveBeenCalledWith('user-1');
    });

    it('propagates the error and never deletes when the user still owns rooms', async () => {
      const user = makeUser({ id: 'user-1' });
      const req = makeReq({ user: { ...user, sessionId: 'session-1' } });
      const res = makeRes();
      vi.mocked(assertHasNoOwnedRooms).mockRejectedValue(
        new Error(
          'User still owns one or more rooms, transfer ownership first',
        ),
      );

      await expect(userController.delete(req, res, next)).rejects.toThrow(
        'User still owns one or more rooms, transfer ownership first',
      );

      expect(userService.delete).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns an accessToken and refreshToken on successful login', async () => {
      const user = makeUser({ id: 'user-1', tokenVersion: 2 });
      vi.mocked(assertIsCorrectEmailAndPassword).mockResolvedValue(user);
      vi.mocked(assertIsConfirmedEmail).mockReturnValue(undefined);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-1',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        body: {
          loginData: { email: 'user@example.com', password: 'Password1' },
        },
      });
      const res = makeRes();

      await userController.login(req, res, next);

      expect(assertIsCorrectEmailAndPassword).toHaveBeenCalledWith(
        'user@example.com',
        'Password1',
      );
      expect(assertIsConfirmedEmail).toHaveBeenCalledWith(user);
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: 'user-1',
        tokenVersion: 2,
        sessionId: 'family-1',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        accessToken: 'signed-access-token',
        refreshToken: 'raw-refresh-token',
      });
    });

    // Regression test: without normalizing the email here, a login attempt
    // with a different letter case than the one used at registration would
    // simply fail to find the user, even though it's the same address.
    it('normalizes the email to lowercase and trimmed before authenticating', async () => {
      const user = makeUser({ id: 'user-1', tokenVersion: 0 });
      vi.mocked(assertIsCorrectEmailAndPassword).mockResolvedValue(user);
      vi.mocked(assertIsConfirmedEmail).mockReturnValue(undefined);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-1',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        body: {
          loginData: {
            email: '  User@Example.com  ',
            password: 'Password1',
          },
        },
      });
      const res = makeRes();

      await userController.login(req, res, next);

      expect(assertIsCorrectEmailAndPassword).toHaveBeenCalledWith(
        'user@example.com',
        'Password1',
      );
    });

    it('throws before a refresh token is created when the email is not confirmed', async () => {
      const user = makeUser({ confirmedEmail: false });
      vi.mocked(assertIsCorrectEmailAndPassword).mockResolvedValue(user);
      vi.mocked(assertIsConfirmedEmail).mockImplementation(() => {
        throw new Error('Email address is not confirmed yet');
      });

      const req = makeReq({
        body: {
          loginData: { email: 'user@example.com', password: 'Password1' },
        },
      });
      const res = makeRes();

      await expect(userController.login(req, res, next)).rejects.toThrow(
        'Email address is not confirmed yet',
      );

      expect(refreshTokenService.create).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });

    it('omits userAgent/ipAddress from the metadata when neither is present on the request', async () => {
      const user = makeUser({ id: 'user-1' });
      vi.mocked(assertIsCorrectEmailAndPassword).mockResolvedValue(user);
      vi.mocked(assertIsConfirmedEmail).mockReturnValue(undefined);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-1',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        headers: {},
        ip: undefined,
        body: {
          loginData: { email: 'user@example.com', password: 'Password1' },
        },
      });
      const res = makeRes();

      await userController.login(req, res, next);

      expect(refreshTokenService.create).toHaveBeenCalledWith('user-1', {});
    });

    it('attaches only userAgent when the user-agent header is present but req.ip is not', async () => {
      const user = makeUser({ id: 'user-1' });
      vi.mocked(assertIsCorrectEmailAndPassword).mockResolvedValue(user);
      vi.mocked(assertIsConfirmedEmail).mockReturnValue(undefined);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-1',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        headers: { 'user-agent': 'Mozilla/5.0' },
        ip: undefined,
        body: {
          loginData: { email: 'user@example.com', password: 'Password1' },
        },
      });
      const res = makeRes();

      await userController.login(req, res, next);

      expect(refreshTokenService.create).toHaveBeenCalledWith('user-1', {
        userAgent: 'Mozilla/5.0',
      });
    });

    it('attaches only ipAddress when req.ip is present but the user-agent header is not', async () => {
      const user = makeUser({ id: 'user-1' });
      vi.mocked(assertIsCorrectEmailAndPassword).mockResolvedValue(user);
      vi.mocked(assertIsConfirmedEmail).mockReturnValue(undefined);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-1',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        headers: {},
        ip: '203.0.113.7',
        body: {
          loginData: { email: 'user@example.com', password: 'Password1' },
        },
      });
      const res = makeRes();

      await userController.login(req, res, next);

      expect(refreshTokenService.create).toHaveBeenCalledWith('user-1', {
        ipAddress: '203.0.113.7',
      });
    });

    it('attaches both userAgent and ipAddress when both are present on the request', async () => {
      const user = makeUser({ id: 'user-1' });
      vi.mocked(assertIsCorrectEmailAndPassword).mockResolvedValue(user);
      vi.mocked(assertIsConfirmedEmail).mockReturnValue(undefined);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-1',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        headers: { 'user-agent': 'Mozilla/5.0' },
        ip: '203.0.113.7',
        body: {
          loginData: { email: 'user@example.com', password: 'Password1' },
        },
      });
      const res = makeRes();

      await userController.login(req, res, next);

      expect(refreshTokenService.create).toHaveBeenCalledWith('user-1', {
        userAgent: 'Mozilla/5.0',
        ipAddress: '203.0.113.7',
      });
    });
  });

  describe('loginWithGoogle', () => {
    it('links the Google id and clears the password when an unconfirmed account with the same email already exists', async () => {
      const existingUser = makeUser({
        id: 'user-1',
        email: 'user@example.com',
        confirmedEmail: false,
        password: 'hashed',
        googleId: null,
        tokenVersion: 3,
      });

      const googleTokenPayload = {
        email: 'user@example.com',
        sub: 'google-sub-1',
        name: 'Test User',
        email_verified: true,
        iss: 'test-issuer',
        aud: 'test-audience',
        iat: 1,
        exp: 2,
      };

      vi.mocked(assertIsValidGoogleToken).mockResolvedValue(googleTokenPayload);
      vi.mocked(assertIsEmailVerified).mockReturnValue(undefined);
      vi.mocked(userService.getOneByGoogleId).mockResolvedValue(null);
      vi.mocked(userService.getOneByEmail).mockResolvedValue(existingUser);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-1',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        body: { googleLoginData: { idToken: 'raw-id-token' } },
      });
      const res = makeRes();

      await userController.loginWithGoogle(req, res, next);

      // The account is linked via the "unconfirmed email" path, which is the
      // one responsible for clearing out the old password (password: null),
      // so the previous password must no longer be usable to log in.
      expect(userService.linkGoogleIdWithUnconfirmedEmail).toHaveBeenCalledWith(
        'user-1',
        'google-sub-1',
      );
      expect(userService.linkGoogleIdWithConfirmedEmail).not.toHaveBeenCalled();

      expect(refreshTokenService.create).toHaveBeenCalledWith('user-1', {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        accessToken: 'signed-access-token',
        refreshToken: 'raw-refresh-token',
      });
    });

    it('logs a warning with userId, googleId, and email when auto-linking clears the password on an unconfirmed account', async () => {
      const existingUser = makeUser({
        id: 'user-1',
        email: 'user@example.com',
        confirmedEmail: false,
        password: 'hashed',
        googleId: null,
        tokenVersion: 3,
      });

      const googleTokenPayload = {
        email: 'user@example.com',
        sub: 'google-sub-1',
        name: 'Test User',
        email_verified: true,
        iss: 'test-issuer',
        aud: 'test-audience',
        iat: 1,
        exp: 2,
      };

      vi.mocked(assertIsValidGoogleToken).mockResolvedValue(googleTokenPayload);
      vi.mocked(assertIsEmailVerified).mockReturnValue(undefined);
      vi.mocked(userService.getOneByGoogleId).mockResolvedValue(null);
      vi.mocked(userService.getOneByEmail).mockResolvedValue(existingUser);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-1',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        body: { googleLoginData: { idToken: 'raw-id-token' } },
      });
      const res = makeRes();

      await userController.loginWithGoogle(req, res, next);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'google_account_link_password_reset',
          userId: 'user-1',
          googleId: 'google-sub-1',
          email: 'user@example.com',
          message: expect.stringContaining('unconfirmed'),
        }),
      );
    });

    it('does not log a warning when linking to an already-confirmed account (no password reset happens)', async () => {
      const existingUser = makeUser({
        id: 'user-2',
        email: 'confirmed@example.com',
        confirmedEmail: true,
        password: 'hashed',
        googleId: null,
        tokenVersion: 1,
      });

      const googleTokenPayload = {
        email: 'confirmed@example.com',
        sub: 'google-sub-2',
        name: 'Confirmed User',
        email_verified: true,
        iss: 'test-issuer',
        aud: 'test-audience',
        iat: 1,
        exp: 2,
      };

      vi.mocked(assertIsValidGoogleToken).mockResolvedValue(googleTokenPayload);
      vi.mocked(assertIsEmailVerified).mockReturnValue(undefined);
      vi.mocked(userService.getOneByGoogleId).mockResolvedValue(null);
      vi.mocked(userService.getOneByEmail).mockResolvedValue(existingUser);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-2',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        body: { googleLoginData: { idToken: 'raw-id-token' } },
      });
      const res = makeRes();

      await userController.loginWithGoogle(req, res, next);

      expect(userService.linkGoogleIdWithConfirmedEmail).toHaveBeenCalledWith(
        'user-2',
        'google-sub-2',
      );
      expect(logger.warn).not.toHaveBeenCalled();
    });

    // Regression test: Google's payload isn't guaranteed to come back
    // lowercase; without normalizing it here, the lookup could miss an
    // existing account stored as "user@example.com".
    it('normalizes the email from the Google payload before looking up an existing account', async () => {
      const existingUser = makeUser({
        id: 'user-3',
        email: 'user@example.com',
        confirmedEmail: true,
        googleId: null,
      });

      const googleTokenPayload = {
        email: 'User@Example.com',
        sub: 'google-sub-3',
        name: 'Test User',
        email_verified: true,
        iss: 'test-issuer',
        aud: 'test-audience',
        iat: 1,
        exp: 2,
      };

      vi.mocked(assertIsValidGoogleToken).mockResolvedValue(googleTokenPayload);
      vi.mocked(assertIsEmailVerified).mockReturnValue(undefined);
      vi.mocked(userService.getOneByGoogleId).mockResolvedValue(null);
      vi.mocked(userService.getOneByEmail).mockResolvedValue(existingUser);
      vi.mocked(refreshTokenService.create).mockResolvedValue({
        rawToken: 'raw-refresh-token',
        familyId: 'family-3',
      });
      vi.mocked(jwtService.sign).mockReturnValue('signed-access-token');

      const req = makeReq({
        body: { googleLoginData: { idToken: 'raw-id-token' } },
      });
      const res = makeRes();

      await userController.loginWithGoogle(req, res, next);

      expect(userService.getOneByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
    });
  });

  describe('refresh', () => {
    it('returns a new accessToken alongside the rotated refreshToken', async () => {
      vi.mocked(assertIsValidRefreshToken).mockResolvedValue({
        rawToken: 'new-raw-token',
        userId: 'user-1',
        familyId: 'family-1',
      });
      const user = makeUser({ id: 'user-1', tokenVersion: 5 });
      vi.mocked(assertIsUser).mockResolvedValue(user);
      vi.mocked(jwtService.sign).mockReturnValue('new-access-token');

      const req = makeReq({
        body: { refreshTokenData: { refreshToken: 'old-raw-token' } },
      });
      const res = makeRes();

      await userController.refresh(req, res, next);

      expect(assertIsValidRefreshToken).toHaveBeenCalledWith('old-raw-token');
      expect(assertIsUser).toHaveBeenCalledWith('user-1');
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: 'user-1',
        tokenVersion: 5,
        sessionId: 'family-1',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        accessToken: 'new-access-token',
        refreshToken: 'new-raw-token',
      });
    });
  });

  describe('logout', () => {
    it('revokes the refresh token when a matching token record is found', async () => {
      vi.mocked(refreshTokenService.findByRawToken).mockResolvedValue({
        id: 'token-1',
      } as never);

      const req = makeReq({
        body: { logoutData: { refreshToken: 'raw-token' } },
      });
      const res = makeRes();

      await userController.logout(req, res, next);

      expect(refreshTokenService.findByRawToken).toHaveBeenCalledWith(
        'raw-token',
      );
      expect(refreshTokenService.revoke).toHaveBeenCalledWith('token-1');
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('does not call revoke when no matching token record is found', async () => {
      vi.mocked(refreshTokenService.findByRawToken).mockResolvedValue(null);

      const req = makeReq({
        body: { logoutData: { refreshToken: 'unknown-token' } },
      });
      const res = makeRes();

      await userController.logout(req, res, next);

      expect(refreshTokenService.findByRawToken).toHaveBeenCalledWith(
        'unknown-token',
      );
      expect(refreshTokenService.revoke).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
  });

  describe('logoutAll', () => {
    it('increments the tokenVersion and revokes every refresh token for the user', async () => {
      const req = makeReq({ user: { id: 'user-1' } });
      const res = makeRes();

      await userController.logoutAll(req, res, next);

      expect(userService.incrementTokenVersion).toHaveBeenCalledWith('user-1');
      expect(refreshTokenService.revokeAllForUser).toHaveBeenCalledWith(
        'user-1',
      );
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
  });

  describe('requestPasswordReset', () => {
    it('reissues a reset token and emails it when the account exists', async () => {
      const user = makeUser({ id: 'user-1', email: 'user@example.com' });
      vi.mocked(userService.getOneByEmail).mockResolvedValue(user);
      vi.mocked(tokenService.reissue).mockResolvedValue('raw-reset-token');

      const req = makeReq({
        body: { resetPasswordData: { email: 'user@example.com' } },
      });
      const res = makeRes();

      await userController.requestPasswordReset(req, res, next);

      expect(userService.getOneByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(tokenService.reissue).toHaveBeenCalledWith({
        type: 'RESET',
        userId: 'user-1',
      });
      expect(mailer.sendResetPasswordEmail).toHaveBeenCalledWith(
        'user@example.com',
        'raw-reset-token',
      );
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    // Regression test: an unnormalized lookup would treat "User@Example.com"
    // as a different account than the one stored as "user@example.com",
    // silently swallowing the request into the "account not found" branch.
    it('normalizes the email to lowercase and trimmed before looking up the account', async () => {
      const user = makeUser({ id: 'user-1', email: 'user@example.com' });
      vi.mocked(userService.getOneByEmail).mockResolvedValue(user);
      vi.mocked(tokenService.reissue).mockResolvedValue('raw-reset-token');

      const req = makeReq({
        body: { resetPasswordData: { email: '  User@Example.com  ' } },
      });
      const res = makeRes();

      await userController.requestPasswordReset(req, res, next);

      expect(userService.getOneByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(mailer.sendResetPasswordEmail).toHaveBeenCalledWith(
        'user@example.com',
        'raw-reset-token',
      );
    });

    it('sends 204 without reissuing a token or emailing when the account does not exist', async () => {
      vi.mocked(userService.getOneByEmail).mockResolvedValue(null);

      const req = makeReq({
        body: { resetPasswordData: { email: 'nobody@example.com' } },
      });
      const res = makeRes();

      await userController.requestPasswordReset(req, res, next);

      expect(userService.getOneByEmail).toHaveBeenCalledWith(
        'nobody@example.com',
      );
      expect(tokenService.reissue).not.toHaveBeenCalled();
      expect(mailer.sendResetPasswordEmail).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('returns the same 204 response for an existing and a non-existent email (anti-enumeration)', async () => {
      const user = makeUser({ id: 'user-1', email: 'user@example.com' });
      vi.mocked(userService.getOneByEmail).mockResolvedValueOnce(user);
      vi.mocked(tokenService.reissue).mockResolvedValue('raw-reset-token');

      const existingReq = makeReq({
        body: { resetPasswordData: { email: 'user@example.com' } },
      });
      const existingRes = makeRes();
      await userController.requestPasswordReset(existingReq, existingRes, next);

      vi.mocked(userService.getOneByEmail).mockResolvedValueOnce(null);

      const missingReq = makeReq({
        body: { resetPasswordData: { email: 'nobody@example.com' } },
      });
      const missingRes = makeRes();
      await userController.requestPasswordReset(missingReq, missingRes, next);

      expect(existingRes.sendStatus).toHaveBeenCalledWith(204);
      expect(missingRes.sendStatus).toHaveBeenCalledWith(204);
      expect(existingRes.status).not.toHaveBeenCalled();
      expect(missingRes.status).not.toHaveBeenCalled();
    });
  });

  describe('confirmPasswordReset', () => {
    it('runs updatePassword, revokeAllForUser, and invalidate inside the transaction, in that order', async () => {
      const tokenRecord = { id: 'token-1', userId: 'user-1' };
      vi.mocked(assertIsValidToken).mockResolvedValue(tokenRecord as never);

      const callOrder: string[] = [];
      let capturedTx: unknown;

      vi.mocked(userService.updatePassword).mockImplementation(async () => {
        callOrder.push('updatePassword');
      });
      vi.mocked(refreshTokenService.revokeAllForUser).mockImplementation(
        async () => {
          callOrder.push('revokeAllForUser');
        },
      );
      vi.mocked(tokenService.invalidate).mockImplementation(async () => {
        callOrder.push('invalidate');
      });
      (vi.mocked(prisma.$transaction) as unknown as Mock).mockImplementation(
        async (callback: (tx: unknown) => Promise<unknown>) => {
          capturedTx = { label: 'tx-client' };
          return callback(capturedTx);
        },
      );

      const req = makeReq<Request<{ resetToken: string }>>({
        params: { resetToken: 'raw-reset-token' },
        body: { resetPasswordData: { newPassword: 'NewPassword1' } },
      });
      const res = makeRes();

      await userController.confirmPasswordReset(req, res, next);

      expect(assertIsValidToken).toHaveBeenCalledWith(
        'raw-reset-token',
        'RESET',
      );
      expect(callOrder).toEqual([
        'updatePassword',
        'revokeAllForUser',
        'invalidate',
      ]);
      expect(userService.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'NewPassword1',
        capturedTx,
      );
      expect(refreshTokenService.revokeAllForUser).toHaveBeenCalledWith(
        'user-1',
        capturedTx,
      );
      expect(tokenService.invalidate).toHaveBeenCalledWith(
        'token-1',
        capturedTx,
      );
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('propagates the error and skips the response when the reset token is invalid', async () => {
      vi.mocked(assertIsValidToken).mockRejectedValue(
        new Error('Invalid token'),
      );

      const req = makeReq<Request<{ resetToken: string }>>({
        params: { resetToken: 'bad-token' },
        body: { resetPasswordData: { newPassword: 'NewPassword1' } },
      });
      const res = makeRes();

      await expect(
        userController.confirmPasswordReset(req, res, next),
      ).rejects.toThrow('Invalid token');

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
  });

  describe('resendActivation', () => {
    it('reissues an activation token and emails it when the account exists and is unconfirmed', async () => {
      const user = makeUser({
        id: 'user-1',
        email: 'user@example.com',
        confirmedEmail: false,
      });
      vi.mocked(userService.getOneByEmail).mockResolvedValue(user);
      vi.mocked(tokenService.reissue).mockResolvedValue('raw-activation-token');

      const req = makeReq({
        body: { resendActivationData: { email: 'user@example.com' } },
      });
      const res = makeRes();

      await userController.resendActivation(req, res, next);

      expect(userService.getOneByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(tokenService.reissue).toHaveBeenCalledWith({
        type: 'ACTIVATION',
        userId: 'user-1',
      });
      expect(mailer.sendActivationEmail).toHaveBeenCalledWith(
        'user@example.com',
        'raw-activation-token',
      );
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    // Regression test: an unnormalized lookup would treat "User@Example.com"
    // as a different account than the one stored as "user@example.com",
    // silently swallowing the resend into the "does nothing" 204 branch.
    it('normalizes the email to lowercase and trimmed before looking up the account', async () => {
      const user = makeUser({
        id: 'user-1',
        email: 'user@example.com',
        confirmedEmail: false,
      });
      vi.mocked(userService.getOneByEmail).mockResolvedValue(user);
      vi.mocked(tokenService.reissue).mockResolvedValue('raw-activation-token');

      const req = makeReq({
        body: { resendActivationData: { email: '  User@Example.com  ' } },
      });
      const res = makeRes();

      await userController.resendActivation(req, res, next);

      expect(userService.getOneByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(mailer.sendActivationEmail).toHaveBeenCalledWith(
        'user@example.com',
        'raw-activation-token',
      );
    });

    it('does nothing but respond 204 when the account does not exist', async () => {
      vi.mocked(userService.getOneByEmail).mockResolvedValue(null);

      const req = makeReq({
        body: { resendActivationData: { email: 'nobody@example.com' } },
      });
      const res = makeRes();

      await userController.resendActivation(req, res, next);

      expect(tokenService.reissue).not.toHaveBeenCalled();
      expect(mailer.sendActivationEmail).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('does nothing but respond 204 when the account exists but the email is already confirmed', async () => {
      const user = makeUser({
        id: 'user-1',
        email: 'user@example.com',
        confirmedEmail: true,
      });
      vi.mocked(userService.getOneByEmail).mockResolvedValue(user);

      const req = makeReq({
        body: { resendActivationData: { email: 'user@example.com' } },
      });
      const res = makeRes();

      await userController.resendActivation(req, res, next);

      expect(tokenService.reissue).not.toHaveBeenCalled();
      expect(mailer.sendActivationEmail).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
  });

  describe('activate', () => {
    it('confirms the email for the token owner when the activation token is valid', async () => {
      const tokenRecord = { id: 'token-1', userId: 'user-1' };
      vi.mocked(assertIsValidToken).mockResolvedValue(tokenRecord as never);

      const req = makeReq<Request<{ activationToken: string }>>({
        params: { activationToken: 'raw-activation-token' },
      });
      const res = makeRes();

      await userController.activate(req, res, next);

      expect(assertIsValidToken).toHaveBeenCalledWith(
        'raw-activation-token',
        'ACTIVATION',
      );
      expect(userService.confirmEmail).toHaveBeenCalledWith(
        'user-1',
        'token-1',
      );
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('propagates the error and never confirms the email when the activation token is invalid', async () => {
      vi.mocked(assertIsValidToken).mockRejectedValue(
        new Error('Invalid token'),
      );

      const req = makeReq<Request<{ activationToken: string }>>({
        params: { activationToken: 'bad-token' },
      });
      const res = makeRes();

      await expect(userController.activate(req, res, next)).rejects.toThrow(
        'Invalid token',
      );

      expect(userService.confirmEmail).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
  });
});
