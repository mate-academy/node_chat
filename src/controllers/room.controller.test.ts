import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { roomController } from './room.controller.js';
import { roomService } from '../services/room.service.js';
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
} from '../utils/checks.js';
import type { Room, RoomMember } from '../generated/prisma/client.js';
import { ZodError } from 'zod';

vi.mock('../services/room.service.js', () => ({
  roomService: {
    getAll: vi.fn(),
    getAllByUserId: vi.fn(),
    getAllUserByRoomId: vi.fn(),
    getOneById: vi.fn(),
    getMemberRole: vi.fn(),
    hasOwnedRoom: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    addUser: vi.fn(),
    changeMemberRole: vi.fn(),
    checkIsUserIn: vi.fn(),
    removeUser: vi.fn(),
    transferOwnership: vi.fn(),
  },
}));

vi.mock('../utils/checks.js', () => ({
  assertHasHigherRole: vi.fn(),
  assertIsAdminOrOwner: vi.fn(),
  assertIsDifferentUser: vi.fn(),
  assertIsOwner: vi.fn(),
  assertIsOwnerTryingToLeave: vi.fn(),
  assertIsRoom: vi.fn(),
  assertIsRoomId: vi.fn(),
  assertIsUser: vi.fn(),
  assertIsUserId: vi.fn(),
  assertIsUserInRoom: vi.fn(),
  assertIsUserIsNotInRoom: vi.fn(),
  getAuthUser: vi.fn((req: Request) => req.user),
}));

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    name: 'General',
    ownerId: 'owner-1',
    lastActivityAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRoomMember(overrides: Partial<RoomMember> = {}): RoomMember {
  return {
    id: 'member-1',
    userId: 'user-1',
    roomId: 'room-1',
    role: 'MEMBER',
    joinedAt: new Date(),
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

describe('roomController', () => {
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  describe('create', () => {
    it('creates a room owned by the requester and responds 201', async () => {
      const room = makeRoom({ name: 'New Room', ownerId: 'user-1' });
      vi.mocked(roomService.create).mockResolvedValue(room);

      const req = makeReq({
        user: { id: 'user-1' },
        body: { roomData: { name: 'New Room' } },
      });
      const res = makeRes();

      await roomController.create(req, res, next);

      expect(roomService.create).toHaveBeenCalledWith({
        name: 'New Room',
        ownerId: 'user-1',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(room);
    });

    it('rejects a room name that is too short and never calls the service', async () => {
      const req = makeReq({
        user: { id: 'user-1' },
        body: { roomData: { name: 'a' } },
      });
      const res = makeRes();

      await expect(roomController.create(req, res, next)).rejects.toThrow();

      expect(roomService.create).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('lets the owner delete the room and responds 204', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsOwner).mockResolvedValue(undefined);

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'owner-1' },
        params: { roomId: 'room-1' },
      });
      const res = makeRes();

      await roomController.delete(req, res, next);

      expect(assertIsRoomId).toHaveBeenCalledWith('room-1');
      expect(assertIsRoom).toHaveBeenCalledWith('room-1');
      expect(assertIsOwner).toHaveBeenCalledWith('owner-1', 'room-1');
      expect(roomService.delete).toHaveBeenCalledWith('room-1');
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('blocks deletion when the requester is not the owner (admin included)', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsOwner).mockRejectedValue(
        new Error('Only the room owner can perform this action'),
      );

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1' },
      });
      const res = makeRes();

      await expect(roomController.delete(req, res, next)).rejects.toThrow(
        'Only the room owner can perform this action',
      );

      expect(roomService.delete).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it('blocks deletion of a room that does not exist before checking ownership', async () => {
      vi.mocked(assertIsRoom).mockRejectedValue(new Error('Room not found'));

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'owner-1' },
        params: { roomId: 'missing-room' },
      });
      const res = makeRes();

      await expect(roomController.delete(req, res, next)).rejects.toThrow(
        'Room not found',
      );

      expect(assertIsOwner).not.toHaveBeenCalled();
      expect(roomService.delete).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });

    // NOTE: assertHasNoOwnedRooms (the "block deletion while dependent data
    // exists" guard) is not wired into roomController.delete in the current
    // source — it's only used when deleting a *user* account, to stop that
    // user from being removed while they still own rooms. Room deletion
    // itself is guarded solely by assertIsOwner, exercised above. If
    // assertHasNoOwnedRooms is later reused here, add a case asserting it's
    // called before roomService.delete and that a rejection prevents
    // deletion, mirroring the assertIsOwner cases.
  });

  describe('update', () => {
    it('lets an admin or owner update the room and responds with the updated room', async () => {
      const room = makeRoom({ id: 'room-1', ownerId: 'owner-1' });
      vi.mocked(assertIsRoom).mockResolvedValue(room);
      vi.mocked(assertIsAdminOrOwner).mockResolvedValue(undefined);
      const updatedRoom = makeRoom({
        id: 'room-1',
        name: 'Renamed',
        ownerId: 'owner-1',
      });
      vi.mocked(roomService.update).mockResolvedValue(updatedRoom);

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1' },
        body: { roomData: { name: 'Renamed' } },
      });
      const res = makeRes();

      await roomController.update(req, res, next);

      expect(assertIsAdminOrOwner).toHaveBeenCalledWith('admin-1', 'room-1');
      expect(roomService.update).toHaveBeenCalledWith('room-1', {
        name: 'Renamed',
        ownerId: 'owner-1',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(updatedRoom);
    });

    it('does not update the room when the requester is a plain member', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsAdminOrOwner).mockRejectedValue(
        new Error('Only room admins or the owner can perform this action'),
      );

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'member-1' },
        params: { roomId: 'room-1' },
        body: { roomData: { name: 'Renamed' } },
      });
      const res = makeRes();

      await expect(roomController.update(req, res, next)).rejects.toThrow(
        'Only room admins or the owner can perform this action',
      );

      expect(roomService.update).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('addUser (join)', () => {
    it('adds the user to the room and responds 200 with the membership', async () => {
      vi.mocked(assertIsAdminOrOwner).mockResolvedValue(undefined);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsUserIsNotInRoom).mockResolvedValue(undefined);
      const room = { ...makeRoom(), members: [makeRoomMember()] };
      vi.mocked(roomService.addUser).mockResolvedValue(room as never);

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1' },
        body: { userId: 'user-1' },
      });
      const res = makeRes();

      await roomController.addUser(req, res, next);

      expect(assertIsAdminOrOwner).toHaveBeenCalledWith('admin-1', 'room-1');
      expect(assertIsUser).toHaveBeenCalledWith('user-1');
      expect(assertIsUserIsNotInRoom).toHaveBeenCalledWith('user-1', 'room-1');
      expect(roomService.addUser).toHaveBeenCalledWith('room-1', 'user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(room);
    });

    it('rejects a duplicate join when the user is already a member', async () => {
      vi.mocked(assertIsAdminOrOwner).mockResolvedValue(undefined);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsUserIsNotInRoom).mockRejectedValue(
        new Error('User is already a member of this room'),
      );

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1' },
        body: { userId: 'user-1' },
      });
      const res = makeRes();

      await expect(roomController.addUser(req, res, next)).rejects.toThrow(
        'User is already a member of this room',
      );

      expect(roomService.addUser).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects joining when the target user does not exist', async () => {
      vi.mocked(assertIsAdminOrOwner).mockResolvedValue(undefined);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUser).mockRejectedValue(new Error('User not found'));

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1' },
        body: { userId: 'ghost-user' },
      });
      const res = makeRes();

      await expect(roomController.addUser(req, res, next)).rejects.toThrow(
        'User not found',
      );

      expect(assertIsUserIsNotInRoom).not.toHaveBeenCalled();
      expect(roomService.addUser).not.toHaveBeenCalled();
    });

    // Regression test: addUser must check room existence *before* the
    // permission check, matching every other method on this controller.
    // Previously the order was reversed, so a request against a
    // non-existent room surfaced as 403 Forbidden (from assertIsAdminOrOwner
    // finding no membership row) instead of the expected 404 Not Found.
    it('reports room-not-found (not a permission error) when the room does not exist', async () => {
      vi.mocked(assertIsRoom).mockRejectedValue(new Error('Room not found'));
      vi.mocked(assertIsAdminOrOwner).mockRejectedValue(
        new Error('Only room admins or the owner can perform this action'),
      );

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'missing-room' },
        body: { userId: 'user-1' },
      });
      const res = makeRes();

      await expect(roomController.addUser(req, res, next)).rejects.toThrow(
        'Room not found',
      );

      // assertIsRoom must run, and win, before assertIsAdminOrOwner is ever
      // consulted for a room that doesn't exist.
      expect(assertIsAdminOrOwner).not.toHaveBeenCalled();
      expect(roomService.addUser).not.toHaveBeenCalled();
    });

    it('checks room existence before permission for an existing room too', async () => {
      const callOrder: string[] = [];
      vi.mocked(assertIsRoom).mockImplementation(async () => {
        callOrder.push('assertIsRoom');
        return makeRoom();
      });
      vi.mocked(assertIsAdminOrOwner).mockImplementation(async () => {
        callOrder.push('assertIsAdminOrOwner');
      });
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsUserIsNotInRoom).mockResolvedValue(undefined);
      vi.mocked(roomService.addUser).mockResolvedValue(makeRoom() as never);

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1' },
        body: { userId: 'user-1' },
      });
      const res = makeRes();

      await roomController.addUser(req, res, next);

      expect(callOrder).toEqual(['assertIsRoom', 'assertIsAdminOrOwner']);
    });
  });

  describe('leave', () => {
    it('removes the requester from the room and responds 204', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      vi.mocked(assertIsOwnerTryingToLeave).mockResolvedValue(undefined);

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'user-1' },
        params: { roomId: 'room-1' },
      });
      const res = makeRes();

      await roomController.leave(req, res, next);

      expect(assertIsUser).not.toHaveBeenCalled();
      expect(assertIsUserInRoom).toHaveBeenCalledWith('user-1', 'room-1');
      expect(assertIsOwnerTryingToLeave).toHaveBeenCalledWith(
        'user-1',
        'room-1',
      );
      expect(roomService.removeUser).toHaveBeenCalledWith('room-1', 'user-1');
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('blocks the owner from leaving without transferring ownership first', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      vi.mocked(assertIsOwnerTryingToLeave).mockRejectedValue(
        new Error('Owner cannot leave the room, transfer ownership first'),
      );

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'owner-1' },
        params: { roomId: 'room-1' },
      });
      const res = makeRes();

      await expect(roomController.leave(req, res, next)).rejects.toThrow(
        'Owner cannot leave the room, transfer ownership first',
      );

      expect(roomService.removeUser).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it('rejects leaving a room the user is not a member of', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockRejectedValue(
        new Error('User is not a member of this room'),
      );

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'stranger-1' },
        params: { roomId: 'room-1' },
      });
      const res = makeRes();

      await expect(roomController.leave(req, res, next)).rejects.toThrow(
        'User is not a member of this room',
      );

      expect(assertIsOwnerTryingToLeave).not.toHaveBeenCalled();
      expect(roomService.removeUser).not.toHaveBeenCalled();
    });
  });

  describe('removeUser', () => {
    it('lets an admin remove a member and responds 204', async () => {
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      vi.mocked(assertHasHigherRole).mockResolvedValue(undefined);

      const req = makeReq<Request<{ roomId: string; userId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1', userId: 'user-1' },
      });
      const res = makeRes();

      await roomController.removeUser(req, res, next);

      expect(assertIsUserId).toHaveBeenCalledWith('user-1');
      expect(assertHasHigherRole).toHaveBeenCalledWith(
        'admin-1',
        'user-1',
        'room-1',
        undefined,
        'remove_member',
      );
      expect(roomService.removeUser).toHaveBeenCalledWith('room-1', 'user-1');
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('blocks removal when the actor lacks a higher role than the target', async () => {
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      vi.mocked(assertHasHigherRole).mockRejectedValue(
        new Error('Only admins or the owner can change member roles'),
      );

      const req = makeReq<Request<{ roomId: string; userId: string }>>({
        user: { id: 'member-1' },
        params: { roomId: 'room-1', userId: 'other-member' },
      });
      const res = makeRes();

      await expect(roomController.removeUser(req, res, next)).rejects.toThrow(
        'Only admins or the owner can change member roles',
      );

      expect(roomService.removeUser).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
  });

  describe('getAllUserByRoomId (member listing)', () => {
    it('returns the room members when the requester is a member', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      const members = [makeRoomMember(), makeRoomMember({ id: 'member-2' })];
      vi.mocked(roomService.getAllUserByRoomId).mockResolvedValue(
        members as never,
      );

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'user-1' },
        params: { roomId: 'room-1' },
      });
      const res = makeRes();

      await roomController.getAllUserByRoomId(req, res, next);

      expect(assertIsRoomId).toHaveBeenCalledWith('room-1');
      expect(assertIsRoom).toHaveBeenCalledWith('room-1');
      expect(assertIsUserInRoom).toHaveBeenCalledWith('user-1', 'room-1');
      expect(roomService.getAllUserByRoomId).toHaveBeenCalledWith('room-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(members);
    });

    it('does not list members when the requester is not in the room', async () => {
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockRejectedValue(
        new Error('User is not a member of this room'),
      );

      const req = makeReq<Request<{ roomId: string }>>({
        user: { id: 'outsider-1' },
        params: { roomId: 'room-1' },
      });
      const res = makeRes();

      await expect(
        roomController.getAllUserByRoomId(req, res, next),
      ).rejects.toThrow('User is not a member of this room');

      expect(roomService.getAllUserByRoomId).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('changeMemberRole', () => {
    it("updates the member's role and responds with the updated membership", async () => {
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      vi.mocked(assertHasHigherRole).mockResolvedValue(undefined);
      const updatedMember = makeRoomMember({ role: 'ADMIN' });
      vi.mocked(roomService.changeMemberRole).mockResolvedValue(updatedMember);

      const req = makeReq<Request<{ roomId: string; userId: string }>>({
        user: { id: 'owner-1' },
        params: { roomId: 'room-1', userId: 'user-1' },
        body: { role: 'ADMIN' },
      });
      const res = makeRes();

      await roomController.changeMemberRole(req, res, next);

      expect(assertHasHigherRole).toHaveBeenCalledWith(
        'owner-1',
        'user-1',
        'room-1',
        'ADMIN',
      );
      expect(roomService.changeMemberRole).toHaveBeenCalledWith(
        'user-1',
        'room-1',
        'ADMIN',
      );
      expect(res.send).toHaveBeenCalledWith(updatedMember);
    });

    it('blocks a non-owner from promoting a member to admin/owner', async () => {
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      vi.mocked(assertHasHigherRole).mockRejectedValue(
        new Error('Only the owner can assign the admin or owner role'),
      );

      const req = makeReq<Request<{ roomId: string; userId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1', userId: 'user-1' },
        body: { role: 'ADMIN' },
      });
      const res = makeRes();

      await expect(
        roomController.changeMemberRole(req, res, next),
      ).rejects.toThrow('Only the owner can assign the admin or owner role');

      expect(roomService.changeMemberRole).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });

    it("rejects a role change request with role: 'OWNER' at the schema level", async () => {
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);

      const req = makeReq<Request<{ roomId: string; userId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1', userId: 'user-1' },
        body: { role: 'OWNER' },
      });
      const res = makeRes();

      await expect(
        roomController.changeMemberRole(req, res, next),
      ).rejects.toThrow(ZodError);

      expect(assertHasHigherRole).not.toHaveBeenCalled();
      expect(roomService.changeMemberRole).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('transferOwnership', () => {
    it('lets the owner transfer ownership to another member', async () => {
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      vi.mocked(assertIsOwner).mockResolvedValue(undefined);
      vi.mocked(assertIsDifferentUser).mockReturnValue(undefined);
      const updatedMember = makeRoomMember({
        userId: 'user-1',
        role: 'OWNER',
      });
      vi.mocked(roomService.transferOwnership).mockResolvedValue(updatedMember);

      const req = makeReq<Request<{ roomId: string; userId: string }>>({
        user: { id: 'owner-1' },
        params: { roomId: 'room-1', userId: 'user-1' },
      });
      const res = makeRes();

      await roomController.transferOwnership(req, res, next);

      expect(assertIsOwner).toHaveBeenCalledWith('owner-1', 'room-1');
      expect(assertIsDifferentUser).toHaveBeenCalledWith('owner-1', 'user-1');
      expect(roomService.transferOwnership).toHaveBeenCalledWith(
        'room-1',
        'owner-1',
        'user-1',
      );
      expect(res.send).toHaveBeenCalledWith(updatedMember);
    });

    it('blocks transferring ownership to oneself', async () => {
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      vi.mocked(assertIsOwner).mockResolvedValue(undefined);
      vi.mocked(assertIsDifferentUser).mockImplementation(() => {
        throw new Error('userId1 and userId2 must be different');
      });

      const req = makeReq<Request<{ roomId: string; userId: string }>>({
        user: { id: 'owner-1' },
        params: { roomId: 'room-1', userId: 'owner-1' },
      });
      const res = makeRes();

      await expect(
        roomController.transferOwnership(req, res, next),
      ).rejects.toThrow('userId1 and userId2 must be different');

      expect(roomService.transferOwnership).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });

    it('blocks a non-owner from transferring ownership', async () => {
      vi.mocked(assertIsUser).mockResolvedValue({} as never);
      vi.mocked(assertIsRoom).mockResolvedValue(makeRoom());
      vi.mocked(assertIsUserInRoom).mockResolvedValue(undefined);
      vi.mocked(assertIsOwner).mockRejectedValue(
        new Error('Only the room owner can perform this action'),
      );

      const req = makeReq<Request<{ roomId: string; userId: string }>>({
        user: { id: 'admin-1' },
        params: { roomId: 'room-1', userId: 'user-1' },
      });
      const res = makeRes();

      await expect(
        roomController.transferOwnership(req, res, next),
      ).rejects.toThrow('Only the room owner can perform this action');

      expect(assertIsDifferentUser).not.toHaveBeenCalled();
      expect(roomService.transferOwnership).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('returns every room in the system with default pagination', async () => {
      const result = {
        data: [makeRoom()],
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      };
      vi.mocked(roomService.getAll).mockResolvedValue(result);

      const req = makeReq<
        Request<
          undefined,
          undefined,
          undefined,
          { page?: string; limit?: string }
        >
      >({ query: {} });
      const res = makeRes();

      await roomController.getAll(req, res, next);

      expect(roomService.getAll).toHaveBeenCalledWith(1, 20);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(result);
    });

    it('caps the limit at 100 and floors the page at 1', async () => {
      const result = { data: [], page: 1, limit: 100, total: 0, pages: 0 };
      vi.mocked(roomService.getAll).mockResolvedValue(result);

      const req = makeReq<
        Request<
          undefined,
          undefined,
          undefined,
          { page?: string; limit?: string }
        >
      >({ query: { page: '-5', limit: '500' } });
      const res = makeRes();

      await roomController.getAll(req, res, next);

      expect(roomService.getAll).toHaveBeenCalledWith(1, 100);
    });
  });

  describe('getAllByUserId ("mine")', () => {
    it("returns only the requester's rooms", async () => {
      const result = { data: [makeRoom()], hasMore: false, nextCursor: null };
      vi.mocked(roomService.getAllByUserId).mockResolvedValue(result);

      const req = makeReq<
        Request<
          undefined,
          undefined,
          undefined,
          { cursor?: string; limit?: string }
        >
      >({ user: { id: 'user-1' }, query: {} });
      const res = makeRes();

      await roomController.getAllByUserId(req, res, next);

      expect(roomService.getAllByUserId).toHaveBeenCalledWith(
        'user-1',
        undefined,
        20,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(result);
    });
  });
});
