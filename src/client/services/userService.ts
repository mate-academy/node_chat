import { User } from '@prisma/client';
import { authClient } from '../http/authClient';

export const userService = {
  createUser: (username: string): Promise<User> => {
    return authClient.post(`/users`, { username });
  },
};
