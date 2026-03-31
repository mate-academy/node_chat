import { Room } from '@prisma/client';

import { authClient } from '../http/authClient';
import { RoomFullInform, RoomWithUsersList } from '../types/Room';

export const roomService = {
  joinToRoom: (id: string, userId: number) => {
    return authClient.patch(`/rooms/room/${id}/add-user`, { userId });
  },

  leaveTheRoom: (id: string, userId: number) => {
    return authClient.patch(`/rooms/room/${id}/remove-user`, { userId });
  },

  createRoom: (name: string, userId: number): Promise<Room> => {
    return authClient.post(`/rooms`, { name, userId });
  },

  renameRoom: (id: string, name: string): Promise<Room> => {
    return authClient.patch(`/rooms/room/${id}`, { name });
  },

  getAllRooms: (userId: number): Promise<RoomWithUsersList[]> => {
    return authClient.get(`/rooms/${userId}`);
  },

  getRoom: (roomId: string): Promise<RoomFullInform> => {
    return authClient.get(`/rooms/room/${roomId}`);
  },

  deleteRoom: (roomId: string) => {
    return authClient.delete(`/rooms/room/${roomId}`);
  },
};
