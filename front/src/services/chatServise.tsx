import { httpClient } from '../http/http';
import * as Types from '../types/types';

function getAll(): Promise<Types.Chat[]> {
  return httpClient.get('/chats/');
}

function exitFromChat(chatId: number): Promise<{ message: string }> {
  return httpClient.delete('/chats/exit', { data: { chatId } });
}

function deleteChat(chatId: number): Promise<{ message: string }> {
  return httpClient.delete('/chats/delete', { data: { chatId } })
}

function renameChat(newName: string, chatId: number): Promise<Types.Chat> {
  return httpClient.patch('/chats/rename', { newName, chatId });
}

function addUsers(chatId: number, userIds: number[]): Promise<Types.Chat> {
  return httpClient.patch(`/chats/${chatId}/add-users`, { userIds });
}

function getUsersOfChat(chatId: number): Promise<number[]> {
  return httpClient.get(`/chats/${chatId}/available-users`);
}

export const roomService = {
  getAll,
  exitFromChat,
  deleteChat,
  renameChat,
  addUsers,
  getUsersOfChat,
};
