import { db } from '../utils/db';
import { userService } from './user.service';
import { tokenService } from './token.service';

import { AuthData } from '../types/AuthData';
import { PrismaTransactionClient } from '../types/PrismaTransactionClient';

class AuthService {
  async register(name: string): Promise<AuthData> {
    return db.$transaction(
      async (tx: PrismaTransactionClient): Promise<AuthData> => {
        const normalizedUser = await userService.create(name, tx);
        const tokens = await tokenService.create(normalizedUser, tx);

        return { normalizedUser, ...tokens };
      },
    );
  }
}

export const authService = new AuthService();
