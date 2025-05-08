import { createHash } from 'crypto';

import { db } from '../utils/db';
import { jwt } from '../utils/jwt';
import { ApiError } from '../exceptions/api.error';
import { tokenRepository } from '../entity/token.repository';

import { AuthData } from '../types/AuthData';
import { NormalizedUser } from '../types/NormalizedUser';
import { PrismaTransactionClient } from '../types/PrismaTransactionClient';

class TokenService {
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async create(
    normalizedUser: NormalizedUser,
    tx?: PrismaTransactionClient,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.generateAccessToken(normalizedUser);
    const refreshToken = jwt.generateRefreshToken(normalizedUser);

    await tokenRepository.create(
      normalizedUser.id,
      this.hashToken(refreshToken),
      tx,
    );

    return { accessToken, refreshToken };
  }

  async refresh(token: string): Promise<AuthData> {
    const normalizedUser = jwt.validateRefreshToken(token);

    if (!normalizedUser) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const result = await db.$transaction(
      async (
        tx: PrismaTransactionClient,
      ): Promise<Omit<AuthData, 'normalizedUser'>> => {
        try {
          await tokenRepository.delete(this.hashToken(token), tx);
        } catch (err) {
          if (
            typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            (err as any).code === 'P2025'
          ) {
            throw ApiError.unauthorized('Invalid refresh token');
          }
        }

        return await this.create(normalizedUser, tx);
      },
    );

    return { normalizedUser, ...result };
  }
}

export const tokenService = new TokenService();
