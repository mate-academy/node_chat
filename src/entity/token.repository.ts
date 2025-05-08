import { db } from '../utils/db';
import { Token } from '@prisma/client';
import { PrismaTransactionClient } from '../types/PrismaTransactionClient';

class TokenRepository {
  async create(
    userId: string,
    token: string,
    tx?: PrismaTransactionClient,
  ): Promise<Token> {
    return (tx || db).token.create({
      data: {
        userId,
        token,
      },
    });
  }

  async delete(token: string, tx?: PrismaTransactionClient): Promise<Token> {
    return (tx || db).token.delete({
      where: {
        token,
      },
    });
  }
}

export const tokenRepository = new TokenRepository();
