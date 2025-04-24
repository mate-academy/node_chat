import api from '../api';

export const activateUser = (token: string) => {
  return api.get(`/api/activate/${token}`);
};
