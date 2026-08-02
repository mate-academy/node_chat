import type { User, Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

type UserData = Pick<User, 'name' | 'email' | 'password'>;
type UserGoogleData = Pick<User, 'name' | 'email' | 'googleId'>;
type UpdatedUserData = Pick<User, 'name' | 'email'> &
  Partial<Pick<User, 'confirmedEmail'>>;

type Tx = Prisma.TransactionClient | typeof prisma;

const DEFAULT_LIMIT = 10;
const SALT_ROUNDS = 12;

export const userService = {
  async getOneById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    return user;
  },

  async getOneByEmail(userEmail: string) {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    return user;
  },

  async getOneByGoogleId(userGoogleId: string) {
    const user = await prisma.user.findUnique({
      where: { googleId: userGoogleId },
    });

    return user;
  },

  async create(userData: UserData) {
    const hashPass = userData.password
      ? await bcrypt.hash(userData.password, SALT_ROUNDS)
      : null;
    const user = await prisma.user.create({
      data: { email: userData.email, name: userData.name, password: hashPass },
    });

    return user;
  },

  async createFromGoogle(userGoogleData: UserGoogleData) {
    const user = await prisma.user.create({
      data: {
        email: userGoogleData.email,
        name: userGoogleData.name,
        password: null,
        googleId: userGoogleData.googleId,
        confirmedEmail: true,
      },
    });

    return user;
  },

  async update(userId: string, userData: UpdatedUserData) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
    });

    return updatedUser;
  },

  async updatePassword(userId: string, newPassword: string, tx: Tx = prisma) {
    const hashPass = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await tx.user.update({
      where: { id: userId },
      data: { password: hashPass, tokenVersion: { increment: 1 } },
    });
  },

  async linkGoogleIdWithUnconfirmedEmail(userId: string, googleId: string) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { confirmedEmail: true, googleId, password: null },
      });

      await tx.token.deleteMany({ where: { userId, type: 'ACTIVATION' } });
    });
  },

  async linkGoogleIdWithConfirmedEmail(userId: string, googleId: string) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { confirmedEmail: true, googleId },
      });

      await tx.token.deleteMany({ where: { userId, type: 'ACTIVATION' } });
    });
  },

  async delete(userId: string, tx: Tx = prisma) {
    await tx.user.delete({ where: { id: userId } });
  },

  async verifyPassword(user: User, plainPassword: string) {
    const isValidPassword = await bcrypt.compare(
      plainPassword,
      user?.password ?? '',
    );

    return isValidPassword;
  },

  async confirmEmail(userId: string, tokenId: string) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { confirmedEmail: true },
      });

      await tx.token.delete({ where: { id: tokenId } });
    });
  },

  async incrementTokenVersion(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  },

  async searchUsersByName(
    query: string,
    options: { limit?: number; cursor?: string },
  ) {
    const { limit = DEFAULT_LIMIT, cursor } = options;

    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },

      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    const hasNextPage = users.length > limit;
    const items = hasNextPage ? users.slice(0, limit) : users;

    return {
      items,
      nextCursor: hasNextPage ? items[items.length - 1]?.id : null,
    };
  },
};
