import { httpClient as client } from '../http/httpClient.ts';

const send = async (author: string, text: string, roomId: string) => {
  return (await client.post('/messages', { author, text, roomId }));
}

export const messageService = {
  send,
}