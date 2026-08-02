import type { Prisma, Room } from '../generated/prisma/client.js';
import { Role } from '../generated/prisma/enums.js';
import { prisma } from '../lib/prisma.js';

type RoomData = Pick<Room, 'name' | 'ownerId'>;
type Tx = Prisma.TransactionClient | typeof prisma;

export const roomService = {
  async getAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        orderBy: [{ lastActivityAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.room.count(),
    ]);

    return {
      data: rooms,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  },

  async getAllByUserId(userId: string, cursor?: string, limit: number = 20) {
    const rooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: [{ lastActivityAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor && {
        cursor: {
          id: cursor,
        },
        skip: 1,
      }),
    });

    const hasMore = rooms.length > limit;

    if (hasMore) {
      rooms.pop();
    }

    return {
      data: rooms,
      hasMore,
      nextCursor: hasMore ? rooms?.[rooms.length - 1]?.id : null,
    };
  },

  async getAllUserByRoomId(roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    return room?.members || null;
  },

  async getOneById(roomId: string) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });

    return room;
  },

  async getMemberRole(userId: string, roomId: string) {
    const roomMember = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    return roomMember?.role || null;
  },

  async hasOwnedRoom(userId: string, tx: Tx = prisma) {
    const rooms = await tx.room.findFirst({ where: { ownerId: userId } });

    return !!rooms;
  },

  async create(roomData: RoomData) {
    const room = await prisma.$transaction(async (tx) => {
      const newRoom = await tx.room.create({ data: roomData });

      await tx.roomMember.create({
        data: {
          userId: newRoom.ownerId,
          roomId: newRoom.id,
          role: Role.OWNER,
        },
      });

      return newRoom;
    });

    return room;
  },

  async delete(roomId: string) {
    await prisma.room.delete({ where: { id: roomId } });
  },

  async update(roomId: string, roomData: RoomData) {
    const room = await prisma.room.update({
      where: { id: roomId },
      data: roomData,
    });

    return room;
  },

  async addUser(roomId: string, userId: string) {
    await prisma.roomMember.create({ data: { userId, roomId } });

    const updatedRoom = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    return updatedRoom;
  },

  async changeMemberRole(userId: string, roomId: string, role: Role) {
    const updatedRoomMember = await prisma.roomMember.update({
      where: { userId_roomId: { userId, roomId } },
      data: { role },
    });

    return updatedRoomMember;
  },

  async checkIsUserIn(userId: string, roomId: string): Promise<boolean> {
    const isUserInRoom = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    return isUserInRoom ? true : false;
  },

  async removeUser(roomId: string, userId: string) {
    await prisma.roomMember.delete({
      where: { userId_roomId: { userId, roomId } },
    });

    const updatedRoom = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    return updatedRoom;
  },

  async transferOwnership(
    roomId: string,
    fromUserId: string,
    toUserId: string,
  ) {
    const updatedOwner = await prisma.$transaction(async (tx) => {
      const updatedRoomOwner = await tx.roomMember.update({
        where: { userId_roomId: { userId: toUserId, roomId } },
        data: { role: Role.OWNER },
      });
      await tx.roomMember.update({
        where: { userId_roomId: { userId: fromUserId, roomId } },
        data: { role: Role.ADMIN },
      });
      await tx.room.update({
        where: { id: roomId },
        data: { ownerId: toUserId },
      });

      return updatedRoomOwner;
    });

    return updatedOwner;
  },
};
