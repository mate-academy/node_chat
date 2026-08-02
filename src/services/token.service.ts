import { createHash, randomBytes } from 'node:crypto';
import type { Token, TokenTypes, Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

type TokenData = Pick<Token, 'userId' | 'type'>;
type Tx = Prisma.TransactionClient | typeof prisma;

const EXPIRATION_MS: Record<TokenTypes, number> = {
  ACTIVATION: 24 * 60 * 60 * 1000,
  RESET: 30 * 60 * 1000,
};

export const tokenService = {
  async create(tokenData: TokenData) {
    const expiredTime = new Date(Date.now() + EXPIRATION_MS[tokenData.type]);
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await prisma.token.create({
      data: { ...tokenData, tokenHash, expiredTime },
    });

    return rawToken;
  },

  async verify(rawToken: string, type: TokenTypes) {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const token = await prisma.token.findUnique({ where: { tokenHash } });

    if (!token || token.type !== type) {
      return null;
    }
    if (token.expiredTime < new Date()) {
      return 'expired' as const;
    }

    return token;
  },

  async reissue(tokenData: TokenData) {
    const expiredTime = new Date(Date.now() + EXPIRATION_MS[tokenData.type]);
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await prisma.token.upsert({
      where: {
        userId_type: { type: tokenData.type, userId: tokenData.userId },
      },
      update: { tokenHash, expiredTime },
      create: { ...tokenData, tokenHash, expiredTime },
    });

    return rawToken;
  },

  async invalidate(tokenId: string, tx: Tx = prisma) {
    await tx.token.delete({ where: { id: tokenId } });
  },
};
