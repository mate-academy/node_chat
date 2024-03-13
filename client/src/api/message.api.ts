import { BASE_URL } from 'utils/helpers';
import { Message } from '../types/Message.type';
import { getClient } from '../utils/axiosClient';

const client = getClient(`${BASE_URL}/messages`);

export const getAll = (
  roomId: string,
) => {
  return client.get<Message[]>(`/${roomId}`);
};

export const create = ({
  text,
  author,
  roomId,
}: { text: string, author: string, roomId: string }) => {
  return client.post<Message>('/', { text, author, roomId });
};
