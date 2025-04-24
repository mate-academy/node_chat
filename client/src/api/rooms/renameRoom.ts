import api from '../api';

export const renameRoom = (id: number, name: string) => {
  return api.patch(`/api/rooms/${id}`, { name });
};
