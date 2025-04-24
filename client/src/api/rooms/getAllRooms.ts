import api from '../api';

export const getAllRooms = () => {
  return api.get(`/api/rooms/`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
