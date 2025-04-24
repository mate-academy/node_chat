import api from '../api';

export const deleteRoom = (id: number) => {
  return api.delete(`/api/rooms/${id}`);
};
