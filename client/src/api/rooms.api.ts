import axios from 'axios';
import { Room } from '@/types/Room';
import { BASE_URL, ROOMS } from '@/constants/api';
import { Response } from '@/types/Resonse';
import { handleRequest } from '@/utils/handleRequest';

export const getRooms = async (): Promise<Room[]> => {
  const res: Response<Room[]> = await handleRequest(axios.get(`${BASE_URL}/${ROOMS}`));

  return res.data;
};

export const createRoom = async (name: string): Promise<Room> => {
  const res: Response<Room> = await handleRequest(axios.post(`${BASE_URL}/${ROOMS}`, { name }));

  return res.data;
};

export const removeRoom = async (id: string): Promise<Room> => {
  const res: Response<Room> = await handleRequest(axios.delete(`${BASE_URL}/${ROOMS}/${id}`));

  return res.data;
};

export const getRoomById = async (id: string): Promise<Room> => {
  const res: Response<Room> = await handleRequest(axios.get(`${BASE_URL}/${ROOMS}/${id}`));

  return res.data;
};
