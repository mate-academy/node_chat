import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageHistoryQueryDto } from './dto/message-history-query.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

type MessageCursor = {
  createdAt: string;
  id: string;
};

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureMembership(roomId: string, userId: string) {
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
      include: {
        user: true,
      },
    });

    if (!membership || membership.user.deletedAt) {
      throw new ForbiddenException('User is not a room member');
    }

    return membership;
  }

  async create(roomId: string, data: CreateMessageDto) {
    const normalizedText = data.text.trim();

    if (!normalizedText) {
      throw new BadRequestException('Message cannot be empty');
    }

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

      const membership = await transaction.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId: data.authorId,
          },
        },
        include: {
          user: true,
        },
      });

      if (!membership || membership.user.deletedAt) {
        throw new ForbiddenException('Only room members can send messages');
      }

      const existingMessage = await transaction.message.findUnique({
        where: {
          authorId_clientMessageId: {
            authorId: data.authorId,
            clientMessageId: data.clientMessageId,
          },
        },
      });

      if (existingMessage) {
        if (existingMessage.roomId !== roomId) {
          throw new ConflictException('Client message ID is already in use');
        }

        return existingMessage;
      }

      return transaction.message.create({
        data: {
          clientMessageId: data.clientMessageId,
          text: normalizedText,
          authorName: membership.user.displayName,
          room: {
            connect: {
              id: roomId,
            },
          },
          author: {
            connect: {
              id: data.authorId,
            },
          },
        },
      });
    });
  }

  async findHistory(roomId: string, query: MessageHistoryQueryDto) {
    await this.ensureMembership(roomId, query.userId);

    const limit = query.limit ?? 30;
    const cursor = query.before ? this.decodeCursor(query.before) : null;

    const messages = await this.prisma.message.findMany({
      where: {
        roomId,
        deletedAt: null,
        ...(cursor
          ? {
              OR: [
                {
                  createdAt: {
                    lt: new Date(cursor.createdAt),
                  },
                },
                {
                  createdAt: new Date(cursor.createdAt),
                  id: {
                    lt: cursor.id,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'desc',
        },
      ],
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const selectedMessages = messages.slice(0, limit);
    const oldestMessage = selectedMessages[selectedMessages.length - 1];

    return {
      items: selectedMessages.reverse(),
      nextCursor:
        hasMore && oldestMessage
          ? this.encodeCursor({
              createdAt: oldestMessage.createdAt.toISOString(),
              id: oldestMessage.id,
            })
          : null,
      hasMore,
    };
  }

  async update(roomId: string, messageId: string, data: UpdateMessageDto) {
    const normalizedText = data.text.trim();

    if (!normalizedText) {
      throw new BadRequestException('Message cannot be empty');
    }

    await this.ensureMembership(roomId, data.requesterId);

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        roomId,
        deletedAt: null,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.authorId !== data.requesterId) {
      throw new ForbiddenException('You can edit only your own messages');
    }

    if (message.text === normalizedText) {
      return message;
    }

    return this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        text: normalizedText,
        editedAt: new Date(),
      },
    });
  }

  async remove(roomId: string, messageId: string, requesterId: string) {
    await this.ensureMembership(roomId, requesterId);

    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        roomId,
        deletedAt: null,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.authorId !== requesterId) {
      throw new ForbiddenException('You can delete only your own messages');
    }

    const deletedMessage = await this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      id: deletedMessage.id,
      roomId: deletedMessage.roomId,
      deletedAt: deletedMessage.deletedAt,
    };
  }

  private encodeCursor(cursor: MessageCursor) {
    return Buffer.from(JSON.stringify(cursor)).toString('base64url');
  }

  private decodeCursor(value: string): MessageCursor {
    try {
      const decoded = JSON.parse(
        Buffer.from(value, 'base64url').toString('utf8'),
      ) as Partial<MessageCursor>;

      const createdAt = new Date(decoded.createdAt ?? '');

      if (
        !decoded.id ||
        !decoded.createdAt ||
        Number.isNaN(createdAt.getTime())
      ) {
        throw new Error('Invalid cursor');
      }

      return {
        id: decoded.id,
        createdAt: createdAt.toISOString(),
      };
    } catch {
      throw new BadRequestException('Invalid message cursor');
    }
  }
}
