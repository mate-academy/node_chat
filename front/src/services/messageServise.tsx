import { httpClient } from '../http/http';
import * as Types from '../types/types';

function createMessage(
  text: string,
  chatId: number,
): Promise<Types.MessageWithAuthor> {
  return httpClient.post('/messages', { text, chatId });
}

function getMessages(chatId: number): Promise<Types.MessageWithAuthor[]> {
  return httpClient.get(`/messages/${chatId}`);
}

function deleteMessage(messageId: number, chatId: number): Promise<void> {
  return httpClient.delete(`/messages/${messageId}?chatId=${chatId}`)
};

function updateMessage(messageId: number, newText: string): Promise<Types.Message> {
  return httpClient.put(`/messages/${messageId}`, { newText });
};

export const messageService = {
  createMessage,
  getMessages,
  deleteMessage,
  updateMessage,
};
