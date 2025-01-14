import { httpClient } from '../http/http';
import * as Types from '../types/types';

function getByEmail(
  email: string,
  password: string,
): Promise<Types.User> | null {
  return httpClient.post('/auth/login', { email, password });
}

function create(
  name: string,
  email: string,
  password: string,
): Promise<Types.User> {
  return httpClient.post('/auth/register', { name, email, password });
}

function logout() {
  return httpClient.delete('/logout/');
}

function getUserInfo(): Promise<Types.User> {
  return httpClient.get('/user/info');
}

export const userService = {
  getByEmail,
  create,
  logout,
  getUserInfo,
};
