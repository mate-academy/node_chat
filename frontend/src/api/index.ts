import axios from 'axios';
import { useUserStore } from '../store/store';

const API_URL = import.meta.env.SERVER_API_URL || 'http://localhost:3007';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.get(`${API_URL}/auth/refresh`, {
          withCredentials: true,
        });
        useUserStore.getState().setToken(data.accessToken);
        api.defaults.headers.common['Authorization'] =
          `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
