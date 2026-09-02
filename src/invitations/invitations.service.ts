import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InvitationStatus, RoomMemberRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(roomId: string, data: CreateInvitationDto) {
    return this.prisma.$transaction(async (transaction) => {
      const room = await transaction.room.findFirst({
        where: {
          id: roomId,
          deletedAt: null,
        },
      });

      if (!room) {
        throw new NotFoundException('Room not found');
      }

      const inviter = await transaction.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId: data.invitedById,
          },
        },
      });

      const canInvite =
        inviter?.role === RoomMemberRole.OWNER ||
        inviter?.role === RoomMemberRole.ADMIN;

      if (!canInvite) {
        throw new ForbiddenException(
          'Only room owners and admins can invite users',
        );
      }

      const recipient = await transaction.chatProfile.findFirst({
        where: {
          id: data.recipientId,
          deletedAt: null,
        },
      });

      if (!recipient) {
        throw new NotFoundException('Chat profile not found');
      }

      const membership = await transaction.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId: data.recipientId,
          },
        },
      });

      if (membership) {
        throw new ConflictException('User is already a room member');
      }

      return transaction.roomInvitation.upsert({
        where: {
          roomId_recipientId: {
            roomId,
            recipientId: data.recipientId,
          },
        },
        update: {
          invitedById: data.invitedById,
          status: InvitationStatus.PENDING,
          createdAt: new Date(),
          respondedAt: null,
          expiresAt: null,
        },
        create: {
          roomId,
          recipientId: data.recipientId,
          invitedById: data.invitedById,
        },
      });
    });
  }

  findPending(recipientId: string) {
    return this.prisma.roomInvitation.findMany({
      where: {
        recipientId,
        status: InvitationStatus.PENDING,
        room: {
          deletedAt: null,
        },
        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
      include: {
        room: true,
        invitedBy: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async decline(invitationId: string, data: AcceptInvitationDto) {
    const invitation = await this.prisma.roomInvitation.findFirst({
      where: {
        id: invitationId,
        recipientId: data.recipientId,
        status: InvitationStatus.PENDING,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Pending invitation not found');
    }

    return this.prisma.roomInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: InvitationStatus.DECLINED,
        respondedAt: new Date(),
      },
    });
  }

  async accept(invitationId: string, data: AcceptInvitationDto) {
    return this.prisma.$transaction(async (transaction) => {
      const invitation = await transaction.roomInvitation.findFirst({
        where: {
          id: invitationId,
          recipientId: data.recipientId,
        },
        include: {
          room: true,
        },
      });

      if (!invitation) {
        throw new NotFoundException('Invitation not found');
      }

      if (invitation.room.deletedAt) {
        throw new NotFoundException('Room not found');
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new BadRequestException('Invitation is no longer pending');
      }

      if (invitation.expiresAt && invitation.expiresAt <= new Date()) {
        throw new BadRequestException('Invitation has expired');
      }

      await transaction.roomMember.upsert({
        where: {
          roomId_userId: {
            roomId: invitation.roomId,
            userId: data.recipientId,
          },
        },
        update: {},
        create: {
          roomId: invitation.roomId,
          userId: data.recipientId,
          role: RoomMemberRole.MEMBER,
        },
      });

      return transaction.roomInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: InvitationStatus.ACCEPTED,
          respondedAt: new Date(),
        },
      });
    });
  }
}
