import { CreateMessageI, Message } from '../types/message';
import { client } from '../utils/client.ts';

export const getAllMessage = () => {
  return client.get<Message[]>('/message');
};

export const createMessage = (data: CreateMessageI) => {
  return client.post<Message>('/message', data );
};
