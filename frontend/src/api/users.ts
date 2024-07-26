import { User } from '../types/user.ts';
import { client } from '../utils/client.ts';

export const createNewUser = (name: User) => {
  return client.post<User>('/users', { name });
};

export const getUserById = (id: string) => {
  return client.get<User>(`/users/${id}`);
};

export const getAllUsers = () => {
  return client.get<User[]>('/users');
}
