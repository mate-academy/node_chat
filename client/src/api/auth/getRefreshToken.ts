import api from '../api';

export const getRefreshToken = () => {
  return api.get('/api/refresh', {
    withCredentials: true,
  });
};
