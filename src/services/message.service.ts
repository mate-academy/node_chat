import type { Message } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

type MessageData = Omit<Message, 'id' | 'createdAt' | 'updatedAt'>;

export const messageService = {
  async getAllByRoomId(roomId: string, cursor?: string, limit: number = 20) {
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = messages.length > limit;

    if (hasMore) {
      messages.pop();
    }

    return {
      data: messages,
      hasMore,
      nextCursor: hasMore ? messages?.[messages.length - 1]?.id : null,
    };
  },

  async getOneById(messageId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    return message;
  },

  async create(messageData: MessageData) {
    const message = await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: messageData,
      });

      await tx.room.update({
        where: {
          id: message.roomId,
        },
        data: {
          lastActivityAt: new Date(),
        },
      });

      return message;
    });

    return message;
  },

  async delete(messageId: string) {
    await prisma.message.delete({ where: { id: messageId } });
  },

  async update(messageId: string, messageData: MessageData) {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: messageData,
    });

    return message;
  },
};
