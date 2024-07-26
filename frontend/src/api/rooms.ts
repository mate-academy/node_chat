import { CreateRoomDto, Room } from '../types/room.ts';
import { client } from '../utils/client.ts';

export const getAllRooms = () => {
  return client.get<Room[]>('/rooms');
};

export const createRoom = ({ name, createByUserId }: CreateRoomDto) => {
  return client.post<Room>('/rooms', { name, createByUserId });
};

export const deleteRoom = (id: string) => {
  return client.delete(`/rooms/${id}`);
};

export const updateRoom = (id: string, name: string) => {
  return client.patch(`/rooms/${id}`, { name });
};
