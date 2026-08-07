import { Message } from '../types/Message';
import { httpClient as client } from '../http/httpClient';

export const getMessages = async () => {
  const data = await client.get<Message[]>('/messages');

  return data;
};

export const getMessageById = async (id: string) => {
  const data = await client.get<Message>(`/messages/${id}`);

  return data;
};

export const addMessage = async (
  message: string,
  roomId: string,
  userId: string,
  username: string,
) => {
  const data = await client.post<Message>('/messages', {
    message,
    roomId,
    userId,
    username,
  });

  return data;
};

export const deleteMessage = async (id: string) => {
  const data = await client.delete(`/messages/${id}`);

  return data;
};

export const updateMessage = async (id: string, message: string) => {
  const data = await client.patch<Message>(`/messages/${id}`, {
    message,
  });

  return data;
};

export const getAllByRoomId = async (roomId: string) => {
  const data = await client.get<Message[]>(`/messages/room/${roomId}`);

  return data;
};
