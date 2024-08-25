import { httpClient } from '../http';
import * as Types from '../types';

function getOrCreateByName(name: string): Promise<Types.User> {
  return httpClient.post('/users', { name });
}

export const userService = {
  getOrCreateByName,
};
