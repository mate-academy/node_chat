import { User } from '@prisma/client';

export type NormalizedUser = Pick<User, 'id' | 'name'>;
