import { db } from '../utils/db';
import { Member, Room } from '@prisma/client';
import { RawMessage } from '../types/RawMessage';
import { PrismaTransactionClient } from '../types/PrismaTransactionClient';

type RawRoomInfo = Room & { messages: RawMessage[] };
type RawRoomWithRole = Room & { members: Pick<Member, 'id'>[] };

class RoomRepository {
  getSummary(userId: string): Promise<RawRoomInfo[]> {
    return db.room.findMany({
      where: {
        members: {
          some: { userId },
        },
      },

      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },

          include: {
            author: true,
          },
        },
      },
    });
  }

  get(id: string): Promise<Room | null> {
    return db.room.findUnique({ where: { id } });
  }

  async getWithMember(
    id: string,
    userId: string,
  ): Promise<RawRoomWithRole | null> {
    return db.room.findUnique({
      where: { id },
      include: {
        members: {
          where: { userId },
          select: { id: true },
        },
      },
    });
  }

  create(
    name: string,
    creatorId: string,
    tx?: PrismaTransactionClient,
  ): Promise<Room> {
    return (tx || db).room.create({
      data: { name, creatorId },
    });
  }

  delete(id: string) {
    return db.room.delete({
      where: { id },
    });
  }

  changeName(id: string, name: string): Promise<Room> {
    return db.room.update({
      where: { id },
      data: { name, updatedAt: new Date() },
    });
  }
}

export const roomRepository = new RoomRepository();
