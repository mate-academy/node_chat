import { Member } from '@prisma/client';
import { roomService } from './room.service';
import { memberRepository } from '../entity/member.repository';
import { PrismaTransactionClient } from '../types/PrismaTransactionClient';

import { ApiError } from '../exceptions/api.error';
import { NormalizedRoom } from '../types/NormalizedRoom';
import { messageEmitter } from '../emitters/message.emitter';

class MemberService {
  async create(
    roomId: string,
    userId: string,
    tx?: PrismaTransactionClient,
  ): Promise<Member> {
    const member = await memberRepository.create(roomId, userId, tx);

    return member;
  }

  async join(roomId: string, userId: string): Promise<NormalizedRoom> {
    const normalizedRoom = await roomService.get(roomId);

    if (!normalizedRoom) {
      throw ApiError.notFound('Joining error', {
        name: 'Room with this name does not exist',
      });
    }

    try {
      await memberRepository.create(roomId, userId);
      return normalizedRoom;
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as any).code === 'P2002'
      ) {
        throw ApiError.conflict('Joining error', {
          name: 'Room already in your list',
        });
      }

      throw err;
    }
  }

  async leave(roomId: string, userId: string): Promise<void> {
    const roomWithRole = await roomService.getWithRole(roomId, userId);

    if (roomWithRole.creator) {
      throw ApiError.badRequest(
        'You can not leave this room because you are a creator',
      );
    }

    await memberRepository.delete(roomId, userId);
    messageEmitter.emit('leave', { roomId, userId });
  }
}

export const memberService = new MemberService();
