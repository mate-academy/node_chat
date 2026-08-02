import type { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import { roomService } from '../services/room.service.js';
import { Role } from '../generated/prisma/enums.js';
import {
  assertHasHigherRole,
  assertIsAdminOrOwner,
  assertIsDifferentUser,
  assertIsOwner,
  assertIsOwnerTryingToLeave,
  assertIsRoom,
  assertIsRoomId,
  assertIsUser,
  assertIsUserId,
  assertIsUserInRoom,
  assertIsUserIsNotInRoom,
  getAuthUser,
} from '../utils/checks.js';

const RoomData = z.object({
  name: z
    .string()
    .min(2, 'Room name cannot be empty')
    .max(100, 'Room name cannot exceed 100 characters'),
});

const AddUserBody = z.object({
  userId: z.string(),
});

const changeMemberRoleBody = z.object({
  role: z.enum([Role.ADMIN, Role.MEMBER]),
});

export const roomController = {
  async getOneById(
    req: Request<{ roomId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { roomId } = req.params;

    assertIsRoomId(roomId);

    const room = await assertIsRoom(roomId);

    res.status(200).send(room);
  },

  async getAll(
    req: Request<
      undefined,
      undefined,
      undefined,
      { page?: string; limit?: string }
    >,
    res: Response,
    next: NextFunction,
  ) {
    // NOTE: this intentionally returns every room in the system (a public
    // directory), not just the caller's rooms — see `getAllByUserId` (/mine)
    // for that
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const rooms = await roomService.getAll(page, limit);

    res.status(200).send(rooms);
  },

  async getAllByUserId(
    req: Request<
      undefined,
      undefined,
      undefined,
      { cursor?: string; limit?: string }
    >,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);

    const cursor =
      typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const rooms = await roomService.getAllByUserId(id, cursor, limit);

    res.status(200).send(rooms);
  },

  async getAllUserByRoomId(
    req: Request<{ roomId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { roomId } = req.params;

    assertIsRoomId(roomId);

    await assertIsRoom(roomId);

    await assertIsUserInRoom(id, roomId);

    const users = await roomService.getAllUserByRoomId(roomId);

    res.status(200).send(users);
  },

  async create(req: Request, res: Response, next: NextFunction) {
    const { id } = getAuthUser(req);
    const { roomData } = req.body;

    const verifiedData = RoomData.parse(roomData);

    const room = await roomService.create({ ...verifiedData, ownerId: id });

    res.status(201).send(room);
  },

  async delete(
    req: Request<{ roomId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { roomId } = req.params;

    assertIsRoomId(roomId);

    await assertIsRoom(roomId);

    await assertIsOwner(id, roomId);

    await roomService.delete(roomId);

    res.sendStatus(204);
  },

  async update(
    req: Request<{ roomId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { roomId } = req.params;
    const { roomData } = req.body;

    assertIsRoomId(roomId);

    const room = await assertIsRoom(roomId);

    await assertIsAdminOrOwner(id, roomId);

    const verifiedData = {
      ...RoomData.parse(roomData),
      ownerId: room.ownerId,
    };

    const updatedRoom = await roomService.update(roomId, verifiedData);

    res.status(200).send(updatedRoom);
  },

  async addUser(
    req: Request<{ roomId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { userId } = AddUserBody.parse(req.body);
    const { roomId } = req.params;

    assertIsRoomId(roomId);

    await assertIsRoom(roomId);

    await assertIsAdminOrOwner(id, roomId);

    await assertIsUser(userId);

    await assertIsUserIsNotInRoom(userId, roomId);

    const roomMember = await roomService.addUser(roomId, userId);

    res.status(200).send(roomMember);
  },

  async removeUser(
    req: Request<{ roomId: string; userId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { roomId, userId } = req.params;

    assertIsRoomId(roomId);

    assertIsUserId(userId);

    await assertIsUser(userId);

    await assertIsRoom(roomId);

    await assertIsUserInRoom(userId, roomId);

    await assertHasHigherRole(id, userId, roomId, undefined, 'remove_member');

    await roomService.removeUser(roomId, userId);

    res.sendStatus(204);
  },

  async leave(
    req: Request<{ roomId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { roomId } = req.params;

    assertIsRoomId(roomId);

    await assertIsRoom(roomId);

    await assertIsUserInRoom(id, roomId);

    await assertIsOwnerTryingToLeave(id, roomId);

    await roomService.removeUser(roomId, id);

    res.sendStatus(204);
  },

  async changeMemberRole(
    req: Request<{ roomId: string; userId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { roomId, userId } = req.params;
    const { role } = changeMemberRoleBody.parse(req.body);

    assertIsRoomId(roomId);

    assertIsUserId(userId);

    await assertIsUser(userId);

    await assertIsRoom(roomId);

    await assertIsUserInRoom(userId, roomId);

    await assertHasHigherRole(id, userId, roomId, role);

    const updatedMember = await roomService.changeMemberRole(
      userId,
      roomId,
      role,
    );

    res.send(updatedMember);
  },
  async transferOwnership(
    req: Request<{ roomId: string; userId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = getAuthUser(req);
    const { roomId, userId } = req.params;

    assertIsRoomId(roomId);

    assertIsUserId(userId);

    await assertIsUser(userId);

    await assertIsRoom(roomId);

    await assertIsUserInRoom(userId, roomId);

    await assertIsOwner(id, roomId);

    assertIsDifferentUser(id, userId);

    const updatedMember = await roomService.transferOwnership(
      roomId,
      id,
      userId,
    );

    res.send(updatedMember);
  },
};
