import { httpClient } from '../http/http';
import * as Types from '../types/types';

function createOne(name: string, userIds: number[]): Promise<Types.Chat> {
  return httpClient.post('/createNewChat/', { name, userIds });
}

function getAllUsers(): Promise<Types.NormalizedUserList[]> {
  return httpClient.post('/createNewChat/selectUsers');
}

export const createNewChatService = {
  createOne,
  getAllUsers,
};
