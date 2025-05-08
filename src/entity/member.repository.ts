import { db } from '../utils/db';
import { Member } from '@prisma/client';
import { PrismaTransactionClient } from '../types/PrismaTransactionClient';

class MemberRepository {
  create(
    roomId: string,
    userId: string,
    tx?: PrismaTransactionClient,
  ): Promise<Member> {
    return (tx || db).member.create({ data: { roomId, userId } });
  }

  delete(roomId: string, userId: string): Promise<Member> {
    return db.member.delete({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });
  }

  get(roomId: string, userId: string): Promise<Member | null> {
    return db.member.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
  }
}

export const memberRepository = new MemberRepository();
