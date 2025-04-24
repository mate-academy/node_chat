import axios, { type AxiosRequestConfig } from 'axios';
import store from '../app/store';
import * as authActions from '../features/authentication'; // Adjust the path to your authSlice
import { getRefreshToken } from './auth/getRefreshToken';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuth = store.getState().auth.isAuthenticated;
    const isRefreshRequest = originalRequest.url === '/api/refresh';

    if (
      error.response?.status === 401 &&
      isAuth &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      try {
        const refreshResponse = await getRefreshToken();

        if (refreshResponse.status === 200) {
          const newAccessToken = refreshResponse.data.accessToken;

          store.dispatch(
            authActions.actions.loginSuccess({
              ...store.getState().auth,
              accessToken: newAccessToken,
            })
          );

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return await api(originalRequest as AxiosRequestConfig);
        } else {
          store.dispatch(authActions.actions.logout());
        }
      } catch (refreshError) {
        return await Promise.reject(refreshError);
      }
    }

    return await Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const accessToken = store.getState().auth.accessToken; // Adjust path as needed

    if (
      accessToken &&
      config.headers &&
      config.url !== '/api/login' &&
      config.url !== '/api/refresh'
    ) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
