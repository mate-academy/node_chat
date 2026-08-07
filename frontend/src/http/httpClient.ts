import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { createClient } from './index';
import { authService } from '../api/auth';

export const httpClient = createClient();

httpClient.interceptors.response.use(onResponseSuccess, onResponseError);

function onResponseSuccess<T>(res: { data: T }): T {
  return res.data;
}

let refreshPromise: Promise<unknown> | null = null;

async function onResponseError(error: AxiosError) {
  const originalRequest = error.config as InternalAxiosRequestConfig;

  if (error.response?.status !== 401) {
    throw error;
  }

  try {
    // Only one refresh call in flight at a time — everyone else waits on it
    if (!refreshPromise) {
      refreshPromise = authService.refresh().finally(() => {
        refreshPromise = null;
      });
    }

    await refreshPromise;

    return httpClient.request(originalRequest);
  } catch (err) {
    throw err;
  }
}
