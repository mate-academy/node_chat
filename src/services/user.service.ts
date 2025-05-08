import { User } from '@prisma/client';
import { NormalizedUser } from '../types/NormalizedUser';
import { PrismaTransactionClient } from '../types/PrismaTransactionClient';

import { ApiError } from '../exceptions/api.error';
import { userRepository } from '../entity/user.repository';

class UserService {
  normalize({ id, name }: User): NormalizedUser {
    return { id, name };
  }

  async create(
    name: string,
    tx?: PrismaTransactionClient,
  ): Promise<NormalizedUser> {
    try {
      return this.normalize(await userRepository.create(name, tx));
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as any).code === 'P2002'
      ) {
        throw ApiError.conflict('Registration error', {
          name: 'User already exists',
        });
      }

      throw err;
    }
  }
}

export const userService = new UserService();
