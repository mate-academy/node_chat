import { BASE_URL, MESSAGES } from '@/constants/api';
import { Message } from '@/types/Message';
import { Response } from '@/types/Resonse';
import { handleRequest } from '@/utils/handleRequest';
import axios from 'axios';

export const sendMessage = async (message: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  await handleRequest(axios.post(`${BASE_URL}/${MESSAGES}`, message));
};

export const getMessages = async (roomId: string): Promise<Message[]> => {
  const res: Response<Message[]> = await handleRequest(axios.get(`${BASE_URL}/${MESSAGES}/${roomId}`));

  return res.data;
};
