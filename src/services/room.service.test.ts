import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roomService } from './room.service.js';
import { prisma } from '../lib/prisma.js';
import { Role } from '../generated/prisma/enums.js';
import type { Room, RoomMember } from '../generated/prisma/client.js';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    room: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    roomMember: {
      create: vi.fn(),
      findUnique: vi.fn(),
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

function makeRoomMember(overrides: Partial<RoomMember> = {}): RoomMember {
  return {
    id: 'member-1',
    userId: 'user-1',
    roomId: 'room-1',
    role: Role.MEMBER,
    joinedAt: new Date(),
    ...overrides,
  };
}

describe('roomService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkIsUserIn', () => {
    it('returns true when a membership record exists', async () => {
      vi.mocked(prisma.roomMember.findUnique).mockResolvedValue(
        makeRoomMember(),
      );

      expect(await roomService.checkIsUserIn('user-1', 'room-1')).toBe(true);
    });

    it('returns false when no membership record exists', async () => {
      vi.mocked(prisma.roomMember.findUnique).mockResolvedValue(null);

      expect(await roomService.checkIsUserIn('user-1', 'room-1')).toBe(false);
    });
  });

  describe('hasOwnedRoom', () => {
    it('returns true when the user owns at least one room', async () => {
      vi.mocked(prisma.room.findFirst).mockResolvedValue(makeRoom());

      expect(await roomService.hasOwnedRoom('user-1')).toBe(true);
    });

    it('returns false when the user owns no rooms', async () => {
      vi.mocked(prisma.room.findFirst).mockResolvedValue(null);

      expect(await roomService.hasOwnedRoom('user-1')).toBe(false);
    });
  });

  describe('getMemberRole', () => {
    it('returns the role when the user is a member of the room', async () => {
      vi.mocked(prisma.roomMember.findUnique).mockResolvedValue(
        makeRoomMember({ role: Role.ADMIN }),
      );

      expect(await roomService.getMemberRole('user-1', 'room-1')).toBe(
        Role.ADMIN,
      );
    });

    it('returns null when the user is not a member of the room', async () => {
      vi.mocked(prisma.roomMember.findUnique).mockResolvedValue(null);

      expect(await roomService.getMemberRole('user-1', 'room-1')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates the room and adds the owner as a member with role OWNER, in one transaction', async () => {
      const createdRoom = makeRoom();
      const tx = {
        room: {
          create: vi
            .fn<TransactionClient['room']['create']>()
            .mockResolvedValue(createdRoom),
        },
        roomMember: {
          create: vi
            .fn<TransactionClient['roomMember']['create']>()
            .mockResolvedValue(makeRoomMember({ role: Role.OWNER })),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb) =>
        cb(tx as unknown as TransactionClient),
      );

      const room = await roomService.create({
        name: 'Room',
        ownerId: 'user-1',
      });

      expect(room).toEqual(createdRoom);
      expect(tx.roomMember.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', roomId: 'room-1', role: Role.OWNER },
      });
    });
  });

  describe('transferOwnership', () => {
    it('promotes the new owner to OWNER and demotes the previous owner to ADMIN', async () => {
      const tx = {
        room: {
          update: vi
            .fn<TransactionClient['room']['update']>()
            .mockResolvedValue(makeRoom({ ownerId: 'new-owner' })),
        },
        roomMember: {
          update: vi
            .fn<TransactionClient['roomMember']['update']>()
            .mockResolvedValue(makeRoomMember({ role: Role.OWNER })),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb) =>
        cb(tx as unknown as TransactionClient),
      );

      await roomService.transferOwnership('room-1', 'old-owner', 'new-owner');

      expect(tx.roomMember.update).toHaveBeenNthCalledWith(1, {
        where: { userId_roomId: { userId: 'new-owner', roomId: 'room-1' } },
        data: { role: Role.OWNER },
      });
      expect(tx.roomMember.update).toHaveBeenNthCalledWith(2, {
        where: { userId_roomId: { userId: 'old-owner', roomId: 'room-1' } },
        data: { role: Role.ADMIN },
      });
    });

    it('updates the room ownerId to the new owner', async () => {
      const tx = {
        room: {
          update: vi
            .fn<TransactionClient['room']['update']>()
            .mockResolvedValue(makeRoom({ ownerId: 'new-owner' })),
        },
        roomMember: {
          update: vi
            .fn<TransactionClient['roomMember']['update']>()
            .mockResolvedValue(makeRoomMember({ role: Role.OWNER })),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb) =>
        cb(tx as unknown as TransactionClient),
      );

      await roomService.transferOwnership('room-1', 'old-owner', 'new-owner');

      expect(tx.room.update).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { ownerId: 'new-owner' },
      });
    });
  });
});
