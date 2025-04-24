import api from '../api';

interface Credentials {
  userName: string;
  password: string;
}

export const userLogin = (credentials: Credentials) => {
  return api.post('/api/login', credentials, { withCredentials: true });
};
