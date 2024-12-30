import axios from 'axios';

import { BASE_URL, USERS } from '@/constants/api';
import { Response } from '@/types/Resonse';
import { User } from '@/types/User';
import { handleRequest } from '@/utils/handleRequest';

export const signUp = async (name: string): Promise<User> => {
  const res: Response<User> = await handleRequest(axios.post(`${BASE_URL}/${USERS}/signup`, { name }));

  return res.data;
};

export const signIn = async (name: string): Promise<User> => {
  const res: Response<User> = await handleRequest(axios.post(`${BASE_URL}/${USERS}/signin`, { name }));

  return res.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const res: Response<User> = await handleRequest(axios.get(`${BASE_URL}/${USERS}/${id}`));

  return res.data;
};
