import type { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import { userService } from '../services/user.service.js';
import {
  assertHasNoOwnedRooms,
  assertIsCorrectEmailAndPassword,
  assertIsCorrectPassword,
  assertIsUniqueEmail,
  assertIsUser,
  assertIsValidToken,
  assertIsConfirmedEmail,
  assertIsValidGoogleToken,
  assertIsEmailVerified,
  assertIsValidRefreshToken,
  getAuthUser,
  NotFoundError,
  BadRequestError,
} from '../utils/checks.js';
import type { User } from '../generated/prisma/client.js';
import { jwtService } from '../utils/jwt.js';
import { tokenService } from '../services/token.service.js';
import { mailer } from '../utils/email.js';
import { refreshTokenService } from '../services/refreshToken.service.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { disconnectUserSockets } from '../lib/socket.js';

const stabilizeUser = (user: User) => {
  const { password, ...userWithoutPass } = user;

  return userWithoutPass;
};

const MIN_QUERY_LENGTH = 2;
const MAX_LIMIT = 100;

const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a digit');

const RegisterData = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z
    .string()
    .min(2, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters'),
  password: PasswordSchema,
});

const UpdatedUserData = z.object({
  name: z
    .string()
    .min(2, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

const PasswordData = z.object({
  // Optional: users who signed up via Google only (no password set yet)
  // have nothing to verify this against — see updatePassword below.
  currentPassword: PasswordSchema.optional(),
  newPassword: PasswordSchema,
});

const LoginData = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string(),
});

const RefreshTokenData = z.object({ refreshToken: z.string() });

const GoogleLoginData = z.object({
  idToken: z.string(),
});

const GoogleTokenData = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  sub: z.string(),
  name: z.string(),
  email_verified: z.boolean(),
});

const ResendActivationData = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

const RequestPasswordResetData = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

const ConfirmPasswordResetData = z.object({
  newPassword: PasswordSchema,
});

const LogoutData = z.object({ refreshToken: z.string() });

const SearchUsersQuery = z.object({
  query: z.string().min(MIN_QUERY_LENGTH, 'Query cannot be empty'),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional(),
  cursor: z.string().optional(),
});

export const userController = {
  async register(req: Request, res: Response, next: NextFunction) {
    const { registerData } = req.body;
    const verifiedData = RegisterData.parse(registerData);

    await assertIsUniqueEmail(verifiedData.email);

    const user = await userService.create(verifiedData);
    const rawToken = await tokenService.create({
      userId: user.id,
      type: 'ACTIVATION',
    });

    await mailer.sendSafely(
      () => mailer.sendActivationEmail(user.email, rawToken),
      { event: 'register_activation_email', userId: user.id },
    );

    res.status(201).send(stabilizeUser(user));
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    const user = getAuthUser(req);

    res.status(200).send(stabilizeUser(user));
  },

  async update(req: Request, res: Response, next: NextFunction) {
    const currentUser = getAuthUser(req);
    const { userData } = req.body;
    const verifiedData = UpdatedUserData.parse(userData);

    const isEmailChanged = verifiedData.email !== currentUser.email;

    if (isEmailChanged) {
      await assertIsUniqueEmail(verifiedData.email);
    }

    const user = await userService.update(currentUser.id, {
      ...verifiedData,
      ...(isEmailChanged ? { confirmedEmail: false } : {}),
    });

    if (isEmailChanged) {
      const rawToken = await tokenService.reissue({
        userId: user.id,
        type: 'ACTIVATION',
      });
      await mailer.sendSafely(
        () => mailer.sendActivationEmail(user.email, rawToken),
        { event: 'update_email_activation_email', userId: user.id },
      );
    }

    res.status(200).send(stabilizeUser(user));
  },

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    const user = getAuthUser(req);
    const { passwordData } = req.body;
    const verifiedData = PasswordData.parse(passwordData);

    if (user.password === null) {
      // Google-only account with no password set yet: there is nothing to
      // verify currentPassword against, so this call sets an initial
      // password instead of changing an existing one.
      if (verifiedData.currentPassword) {
        throw new BadRequestError(
          'This account has no password set; omit currentPassword to set one',
        );
      }
    } else {
      if (!verifiedData.currentPassword) {
        throw new BadRequestError('currentPassword is required');
      }

      await assertIsCorrectPassword(user, verifiedData.currentPassword);
    }

    await prisma.$transaction(async (tx) => {
      await userService.updatePassword(user.id, verifiedData.newPassword, tx);
      await refreshTokenService.revokeAllForUser(user.id, tx);
    });

    disconnectUserSockets(user.id);

    res.sendStatus(204);
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = getAuthUser(req);

    // Check-then-delete is run inside a single transaction so a room
    // cannot be created by the user between the ownership check and the
    // actual deletion (TOCTOU) — see assertHasNoOwnedRooms / userService.delete.
    await prisma.$transaction(async (tx) => {
      await assertHasNoOwnedRooms(id, tx);
      await userService.delete(id, tx);
    });

    disconnectUserSockets(id);

    res.sendStatus(204);
  },

  async login(req: Request, res: Response, next: NextFunction) {
    const { loginData } = req.body;
    const verifiedData = LoginData.parse(loginData);

    const user = await assertIsCorrectEmailAndPassword(
      verifiedData.email,
      verifiedData.password,
    );

    assertIsConfirmedEmail(user);

    const metadata = {
      ...(req.headers['user-agent'] && {
        userAgent: req.headers['user-agent'],
      }),
      ...(req.ip && {
        ipAddress: req.ip,
      }),
    };

    const { rawToken: refreshToken, familyId } =
      await refreshTokenService.create(user.id, metadata);

    const token = jwtService.sign({
      userId: user.id,
      tokenVersion: user.tokenVersion,
      sessionId: familyId,
    });

    res.status(200).send({ accessToken: token, refreshToken });
  },

  async loginWithGoogle(req: Request, res: Response, next: NextFunction) {
    const { googleLoginData } = req.body;
    const verifiedData = GoogleLoginData.parse(googleLoginData);

    const googleTokenData = await assertIsValidGoogleToken(
      verifiedData.idToken,
    );

    const { email, sub, name, email_verified } =
      GoogleTokenData.parse(googleTokenData);

    assertIsEmailVerified(email_verified);

    const metadata = {
      ...(req.headers['user-agent'] && {
        userAgent: req.headers['user-agent'],
      }),
      ...(req.ip && {
        ipAddress: req.ip,
      }),
    };

    const userByGoogleId = await userService.getOneByGoogleId(sub);

    if (userByGoogleId) {
      const { rawToken: refreshToken, familyId } =
        await refreshTokenService.create(userByGoogleId.id, metadata);

      const token = jwtService.sign({
        userId: userByGoogleId.id,
        tokenVersion: userByGoogleId.tokenVersion,
        sessionId: familyId,
      });

      res.status(200).send({ accessToken: token, refreshToken });
    } else {
      const userByEmail = await userService.getOneByEmail(email);

      if (userByEmail) {
        if (userByEmail.confirmedEmail === true) {
          // Auto-linking Google account by verified email — Google's email_verified already proves ownership, so this is safe
          await userService.linkGoogleIdWithConfirmedEmail(userByEmail.id, sub);
        } else {
          await userService.linkGoogleIdWithUnconfirmedEmail(
            userByEmail.id,
            sub,
          );
          logger.warn({
            event: 'google_account_link_password_reset',
            userId: userByEmail.id,
            googleId: sub,
            email: userByEmail.email,
            message:
              'Auto-linking Google account to unconfirmed email — resetting password',
          });
        }

        const { rawToken: refreshToken, familyId } =
          await refreshTokenService.create(userByEmail.id, metadata);

        const token = jwtService.sign({
          userId: userByEmail.id,
          tokenVersion: userByEmail.tokenVersion,
          sessionId: familyId,
        });

        res.status(200).send({ accessToken: token, refreshToken });
      } else {
        const userData = { name, email, googleId: sub };
        const createdUser = await userService.createFromGoogle(userData);

        const { rawToken: refreshToken, familyId } =
          await refreshTokenService.create(createdUser.id, metadata);

        const token = jwtService.sign({
          userId: createdUser.id,
          tokenVersion: createdUser.tokenVersion,
          sessionId: familyId,
        });

        res.status(200).send({ accessToken: token, refreshToken });
      }
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    const { refreshTokenData } = req.body;
    const verifiedData = RefreshTokenData.parse(refreshTokenData);

    const result = await assertIsValidRefreshToken(verifiedData.refreshToken);
    const user = await assertIsUser(result.userId);

    const token = jwtService.sign({
      userId: user.id,
      tokenVersion: user.tokenVersion,
      sessionId: result.familyId,
    });

    res.status(200).send({ accessToken: token, refreshToken: result.rawToken });
  },

  async activate(
    req: Request<{ activationToken: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { activationToken } = req.params;
    const tokenRecord = await assertIsValidToken(activationToken, 'ACTIVATION');

    await userService.confirmEmail(tokenRecord.userId, tokenRecord.id);

    res.sendStatus(204);
  },

  async resendActivation(req: Request, res: Response, next: NextFunction) {
    const { resendActivationData } = req.body;
    const verifiedData = ResendActivationData.parse(resendActivationData);

    const user = await userService.getOneByEmail(verifiedData.email);

    if (user && user.confirmedEmail === false) {
      const rawToken = await tokenService.reissue({
        type: 'ACTIVATION',
        userId: user.id,
      });

      await mailer.sendSafely(
        () => mailer.sendActivationEmail(user.email, rawToken),
        { event: 'resend_activation_email', userId: user.id },
      );
    }

    res.sendStatus(204);
  },

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    const { resetPasswordData } = req.body;
    const verifiedData = RequestPasswordResetData.parse(resetPasswordData);

    const user = await userService.getOneByEmail(verifiedData.email);

    if (user) {
      const rawToken = await tokenService.reissue({
        type: 'RESET',
        userId: user.id,
      });

      await mailer.sendSafely(
        () => mailer.sendResetPasswordEmail(user.email, rawToken),
        { event: 'password_reset_email', userId: user.id },
      );
    }

    res.sendStatus(204);
  },

  async confirmPasswordReset(
    req: Request<{ resetToken: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { resetToken } = req.params;
    const { resetPasswordData } = req.body;
    const verifiedData = ConfirmPasswordResetData.parse(resetPasswordData);

    const tokenRecord = await assertIsValidToken(resetToken, 'RESET');

    await prisma.$transaction(async (tx) => {
      await userService.updatePassword(
        tokenRecord.userId,
        verifiedData.newPassword,
        tx,
      );
      await refreshTokenService.revokeAllForUser(tokenRecord.userId, tx);
      await tokenService.invalidate(tokenRecord.id, tx);
    });

    disconnectUserSockets(tokenRecord.userId);

    res.sendStatus(204);
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    const { logoutData } = req.body;
    const { refreshToken } = LogoutData.parse(logoutData);

    const token = await refreshTokenService.findByRawToken(refreshToken);

    if (token) {
      await refreshTokenService.revoke(token.id);
    }

    res.sendStatus(204);
  },

  async logoutAll(req: Request, res: Response, next: NextFunction) {
    const { id } = getAuthUser(req);

    await userService.incrementTokenVersion(id);
    await refreshTokenService.revokeAllForUser(id);

    disconnectUserSockets(id);

    res.sendStatus(204);
  },

  async getSessions(req: Request, res: Response, next: NextFunction) {
    const { id, sessionId } = getAuthUser(req);

    const sessions = await refreshTokenService.listSessions(id);

    const formattedSessions = sessions.map(({ familyId, ...session }) => ({
      ...session,
      isCurrent: familyId === sessionId,
    }));

    res.status(200).send(formattedSessions);
  },

  async revokeSession(
    req: Request<{ sessionId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { sessionId } = req.params;

    const revoked = await refreshTokenService.revokeForUser(id, sessionId);

    if (!revoked) {
      throw new NotFoundError('Session not found');
    }

    res.sendStatus(204);
  },

  async search(
    req: Request<
      unknown,
      unknown,
      unknown,
      { query: string; limit?: string; cursor?: string }
    >,
    res: Response,
    next: NextFunction,
  ) {
    const { query, limit, cursor } = SearchUsersQuery.parse(req.query);

    const result = await userService.searchUsersByName(query, {
      ...(limit !== undefined && { limit }),
      ...(cursor !== undefined && { cursor }),
    });

    res.status(200).send(result);
  },
};
