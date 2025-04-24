import api from '../api';

export const createRoom = (name: string) => {
  return api.post('/api/rooms/create', { name });
};
