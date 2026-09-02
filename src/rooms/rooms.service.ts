import { randomUUID } from 'node:crypto';
import { JoinRoomDto } from './dto/join-room.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomMemberRole, RoomVisibility } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { DeleteRoomDto } from './dto/delete-room.dto';
@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoomDto) {
    const { ownerId, ...roomData } = data;
    const slug = this.createSlug(data.name);

    return this.prisma.$transaction(async (transaction) => {
      const owner = await transaction.chatProfile.findFirst({
        where: {
          id: ownerId,
          deletedAt: null,
        },
      });

      if (!owner) {
        throw new NotFoundException('Chat profile not found');
      }

      return transaction.room.create({
        data: {
          ...roomData,
          slug,
          owner: {
            connect: {
              id: ownerId,
            },
          },
          members: {
            create: {
              role: RoomMemberRole.OWNER,
              user: {
                connect: {
                  id: ownerId,
                },
              },
            },
          },
        },
        include: {
          members: true,
        },
      });
    });
  }

  async join(id: string, data: JoinRoomDto) {
    return this.prisma.$transaction(async (transaction) => {
      const room = await transaction.room.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      if (room.visibility === RoomVisibility.PRIVATE) {
        throw new ForbiddenException('Private room requires an invitation');
      }

      const user = await transaction.chatProfile.findFirst({
        where: {
          id: data.userId,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new NotFoundException('Chat profile not found');
      }

      return transaction.roomMember.upsert({
        where: {
          roomId_userId: {
            roomId: id,
            userId: data.userId,
          },
        },
        update: {},
        create: {
          roomId: id,
          userId: data.userId,
          role: RoomMemberRole.MEMBER,
        },
      });
    });
  }

  async update(id: string, data: UpdateRoomDto) {
    const { requesterId, ...updates } = data;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No room changes provided');
    }

    return this.prisma.$transaction(async (transaction) => {
      const room = await transaction.room.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      if (room.ownerId !== requesterId) {
        throw new ForbiddenException('Only the room owner can update the room');
      }

      return transaction.room.update({
        where: {
          id,
        },
        data: updates,
      });
    });
  }

  async remove(id: string, data: DeleteRoomDto) {
    return this.prisma.$transaction(async (transaction) => {
      const room = await transaction.room.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      if (room.ownerId !== data.requesterId) {
        throw new ForbiddenException('Only the room owner can delete the room');
      }

      return transaction.room.update({
        where: {
          id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    });
  }

  private createSlug(name: string): string {
    const normalizedName = name
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const baseSlug = normalizedName || 'room';
    const suffix = randomUUID().slice(0, 8);

    return `${baseSlug}-${suffix}`;
  }

  findAll(userId: string) {
    return this.prisma.room.findMany({
      where: {
        deletedAt: null,
        OR: [
          {
            visibility: RoomVisibility.PUBLIC,
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        members: {
          where: {
            userId,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const room = await this.prisma.room.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const isMember = room.members.some((member) => member.userId === userId);

    if (room.visibility === RoomVisibility.PRIVATE && !isMember) {
      throw new ForbiddenException('Private room is available only to members');
    }

    return room;
  }

  async leave(roomId: string, userId: string) {
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        deletedAt: null,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const membership = await this.prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Room membership not found');
    }

    if (membership.role === RoomMemberRole.OWNER) {
      throw new BadRequestException('Room owner cannot leave the room');
    }

    return this.prisma.roomMember.delete({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });
  }
}
