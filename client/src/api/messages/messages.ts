import { type Message } from '../../types/messagesResponce';
import api from '../api';

export const getMassesges = (identifier: string) => {
  return api.get(`/api/messages/${identifier}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createMessage = (message: Omit<Message, 'id' | 'createdAt'>) => {
  return api.post('/api/messages/create', { ...message });
};
