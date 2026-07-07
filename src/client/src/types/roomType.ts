import type { User } from './userType';

export type Room = {
  name: string;
  users: User[];
  _id: string;
};
