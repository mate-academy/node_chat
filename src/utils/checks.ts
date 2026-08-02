import type { Role, TokenTypes } from '../generated/prisma/enums.js';
import { messageService } from '../services/message.service.js';
import { roomService } from '../services/room.service.js';
import { userService } from '../services/user.service.js';
import type { Prisma, User } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { tokenService } from '../services/token.service.js';
import { googleService } from './google.js';
import { refreshTokenService } from '../services/refreshToken.service.js';
import type { Request } from 'express';

type Tx = Prisma.TransactionClient | typeof prisma;

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class BadRequestError extends Error {
  constructor(message = 'Bad Request') {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not Found') {
    super(message);
    this.name = 'NotFoundError';
  }
}
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class GoneError extends Error {
  constructor(message = 'Gone') {
    super(message);
    this.name = 'GoneError';
  }
}

/**
 * Requires an authenticated user. Throws UnauthorizedError if req.user is not set.
 * For endpoints where auth is optional, do NOT use this — check req.user directly
 * (typed as Request['user'] | undefined) and handle both branches.
 */
export function getAuthUser<
  P = unknown,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown,
  Locals extends Record<string, unknown> = Record<string, unknown>,
>(req: Request<P, ResBody, ReqBody, ReqQuery, Locals>) {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  return req.user;
}

export async function assertIsOwner(
  userId: string,
  roomId: string,
): Promise<void> {
  const role = await roomService.getMemberRole(userId, roomId);
  if (role !== 'OWNER') {
    throw new ForbiddenError('Only the room owner can perform this action');
  }
}

export async function assertIsOwnerTryingToLeave(
  userId: string,
  roomId: string,
): Promise<void> {
  const role = await roomService.getMemberRole(userId, roomId);
  if (role === 'OWNER') {
    throw new ConflictError(
      'Owner cannot leave the room, transfer ownership first',
    );
  }
}

export async function assertIsAdminOrOwner(
  userId: string,
  roomId: string,
): Promise<void> {
  const role = await roomService.getMemberRole(userId, roomId);
  if (role !== 'ADMIN' && role !== 'OWNER') {
    throw new ForbiddenError(
      'Only room admins or the owner can perform this action',
    );
  }
}

export function assertIsAuthor(userId: string, authorId: string) {
  if (userId !== authorId) {
    throw new ForbiddenError('Only the author can perform this action');
  }
}

type HigherRoleAction = 'change_role' | 'remove_member';

const HIGHER_ROLE_ACTION_LABEL: Record<HigherRoleAction, string> = {
  change_role: 'change member roles',
  remove_member: 'remove members',
};

export async function assertHasHigherRole(
  actorId: string,
  targetId: string,
  roomId: string,
  newRole?: Role,
  action: HigherRoleAction = 'change_role',
): Promise<void> {
  const targetRole = await roomService.getMemberRole(targetId, roomId);
  const actorRole = await roomService.getMemberRole(actorId, roomId);
  const actionLabel = HIGHER_ROLE_ACTION_LABEL[action];

  if (newRole === 'OWNER') {
    throw new ForbiddenError(
      'Use transfer ownership endpoint to assign the owner role',
    );
  }

  if (actorRole !== 'ADMIN' && actorRole !== 'OWNER') {
    throw new ForbiddenError(`Only admins or the owner can ${actionLabel}`);
  }

  if (targetRole === 'OWNER') {
    throw new ForbiddenError(
      action === 'remove_member'
        ? 'Cannot remove the room owner'
        : 'Cannot change the role of the room owner',
    );
  }

  if (targetRole === 'ADMIN' && actorRole !== 'OWNER') {
    throw new ForbiddenError(
      action === 'remove_member'
        ? 'Only the owner can remove an admin'
        : "Only the owner can change an admin's role",
    );
  }

  if (actorRole !== 'OWNER' && newRole === 'ADMIN') {
    throw new ForbiddenError('Only the owner can assign the admin role');
  }
}

export async function assertIsUserInRoom(
  userId: string,
  roomId: string,
): Promise<void> {
  const isUserInRoom = await roomService.checkIsUserIn(userId, roomId);
  if (!isUserInRoom) {
    throw new ForbiddenError('User is not a member of this room');
  }
}

export async function assertIsUserIsNotInRoom(
  userId: string,
  roomId: string,
): Promise<void> {
  const isUserInRoom = await roomService.checkIsUserIn(userId, roomId);
  if (isUserInRoom) {
    throw new ForbiddenError('User is already a member of this room');
  }
}

export async function assertIsRoom(roomId: string) {
  const room = await roomService.getOneById(roomId);
  if (!room) {
    throw new NotFoundError('Room not found');
  }

  return room;
}

export async function assertIsMessage(messageId: string) {
  const message = await messageService.getOneById(messageId);
  if (!message) {
    throw new NotFoundError('Message not found');
  }

  return message;
}

export async function assertIsUser(userId: string) {
  const user = await userService.getOneById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

export async function assertIsUniqueEmail(email: string) {
  const user = await userService.getOneByEmail(email);
  if (user) {
    throw new ConflictError('This email is already in use');
  }

  return user;
}

export async function assertIsCorrectPassword(
  user: User,
  plainPassword: string,
) {
  const isValid = await userService.verifyPassword(user, plainPassword);
  if (!isValid) {
    throw new UnauthorizedError('Incorrect password');
  }
}

export async function assertIsCorrectEmailAndPassword(
  userEmail: string,
  plainPassword: string,
) {
  // Note: both branches intentionally share the same message.
  // Returning "user not found" vs "wrong password" separately would let an
  // attacker enumerate which emails are registered, so we keep it generic here.
  const user = await userService.getOneByEmail(userEmail);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValidPassword = await userService.verifyPassword(user, plainPassword);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return user;
}

export function assertIsConfirmedEmail(user: User) {
  if (!user.confirmedEmail) {
    throw new ForbiddenError('Email address is not confirmed yet');
  }
}

export async function assertIsValidToken(rawToken: string, type: TokenTypes) {
  const token = await tokenService.verify(rawToken, type);
  if (token === 'expired') {
    throw new GoneError('Token has expired');
  }
  if (!token) {
    throw new UnauthorizedError('Invalid token');
  }

  return token;
}

export async function assertIsValidRefreshToken(rawToken: string) {
  const token = await refreshTokenService.verifyAndRotate(rawToken);

  if (token === 'reused') {
    throw new UnauthorizedError(
      'Refresh token reuse detected — all sessions revoked, please log in again',
    );
  }
  if (token === 'expired') {
    throw new GoneError('Refresh token has expired');
  }
  if (!token) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  return token;
}

export async function assertIsValidGoogleToken(googleToken: string) {
  // googleService.verify rejects (rather than resolving to null) for an
  // invalid, expired, or wrong-audience Google id_token — verifyIdToken
  // throws on those cases instead of returning a falsy payload. Without
  // this catch, that rejection would bubble past this assertion straight
  // to the error middleware as an unhandled 500, instead of the expected
  // 401 for what is really just an authentication failure.
  let token;
  try {
    token = await googleService.verify(googleToken);
  } catch {
    throw new UnauthorizedError('Invalid Google token');
  }

  if (!token) {
    throw new UnauthorizedError('Invalid Google token');
  }

  return token;
}

// Accepts an optional transaction client so the caller can run this check
// in the same transaction as the actual deletion. Without that, a room
// could be created by the user between the check and the delete
// (TOCTOU), since the two operations wouldn't be atomic.
export async function assertHasNoOwnedRooms(userId: string, tx: Tx = prisma) {
  const hasOwnedRoom = await roomService.hasOwnedRoom(userId, tx);
  if (hasOwnedRoom) {
    throw new ConflictError(
      'User still owns one or more rooms, transfer ownership first',
    );
  }
}

export function assertIsRoomId(roomId: string): void {
  if (!roomId) {
    throw new BadRequestError('roomId is required');
  }
}

export function assertIsUserId(userId: string): void {
  if (!userId) {
    throw new BadRequestError('userId is required');
  }
}

export function assertIsMessageId(messageId: string): void {
  if (!messageId) {
    throw new BadRequestError('messageId is required');
  }
}

export function assertIsDifferentUser(userId1: string, userId2: string) {
  if (userId1 === userId2) {
    throw new BadRequestError('userId1 and userId2 must be different');
  }
}

export function assertIsEmailVerified(email_verified: boolean) {
  if (!email_verified) {
    throw new UnauthorizedError('Email is not verified by the provider');
  }
}
