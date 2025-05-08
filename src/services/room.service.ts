import { Room } from '@prisma/client';
import { RawMessage } from '../types/RawMessage';
import { RoomPreview } from '../types/RoomPreview';
import { RoomWithRole } from '../types/RoomWithRole';
import { NormalizedRoom } from '../types/NormalizedRoom';
import { PrismaTransactionClient } from '../types/PrismaTransactionClient';

import { messageService } from './message.service';
import { roomRepository } from '../entity/room.repository';

import { ApiError } from '../exceptions/api.error';
import { messageEmitter } from '../emitters/message.emitter';

class RoomService {
  normalize({ id, name }: Room): NormalizedRoom {
    return { id, name };
  }

  buildRoomPreview(
    room: Room,
    creator: boolean = false,
    lastMessage: RawMessage | null = null,
  ): RoomPreview {
    return {
      ...this.normalize(room),
      creator,

      lastMessage: lastMessage
        ? messageService.buildMessagePreview(lastMessage)
        : null,
    };
  }

  async getSummary(userId: string): Promise<RoomPreview[]> {
    const rawRooms = await roomRepository.getSummary(userId);

    return rawRooms.map(({ messages, ...room }) =>
      this.buildRoomPreview(room, userId === room.creatorId, messages[0]),
    );
  }

  async get(id: string): Promise<NormalizedRoom | null> {
    const room = await roomRepository.get(id);

    return room ? this.normalize(room) : null;
  }

  async create(
    name: string,
    userId: string,
    tx?: PrismaTransactionClient,
  ): Promise<RoomPreview> {
    try {
      const room = await roomRepository.create(name, userId, tx);

      return this.buildRoomPreview(room, true);
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as any).code === 'P2002'
      ) {
        throw ApiError.conflict('Creating error', {
          name: 'Room already exist',
        });
      }

      throw err;
    }
  }

  async getWithRole(id: string, userId: string): Promise<RoomWithRole> {
    const roomWithMember = await roomRepository.getWithMember(id, userId);

    if (!roomWithMember) {
      throw ApiError.notFound('Room not found');
    }

    const { members, ...room } = roomWithMember;

    if (!members.length) {
      throw ApiError.forbidden();
    }

    return {
      ...this.normalize(room),
      creator: userId === room.creatorId,
    };
  }

  async delete(id: string, userId: string): Promise<void> {
    const roomWithRole = await this.getWithRole(id, userId);

    if (!roomWithRole.creator) {
      throw ApiError.forbidden();
    }

    await roomRepository.delete(id);
    messageEmitter.emit('delete', { roomId: id });
  }

  async changeName(
    id: string,
    userId: string,
    newName: string,
  ): Promise<RoomWithRole> {
    const roomWithRole = await this.getWithRole(id, userId);

    if (!roomWithRole.creator) {
      throw ApiError.forbidden();
    }

    if (roomWithRole.name === newName) {
      throw ApiError.badRequest('Changing error', {
        name: 'New name must be different',
      });
    }

    try {
      const rawRoom = await roomRepository.changeName(id, newName);
      messageEmitter.emit('changeName', { roomId: id, newName });

      return {
        ...this.normalize(rawRoom),
        creator: true,
      };
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as any).code === 'P2002'
      ) {
        throw ApiError.conflict('Changing error', {
          name: 'Room already exist',
        });
      }

      throw err;
    }
  }
}

export const roomService = new RoomService();
