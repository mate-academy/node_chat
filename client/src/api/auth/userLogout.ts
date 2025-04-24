import api from '../api';

export const userLogout = () => {
  return api.post('/api/logout', { withCredentials: true });
};
