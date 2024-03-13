// axios docs https://axios-http.com/docs/intro
import axios from 'axios';
import { BASE_URL } from './helpers';

export function getClient(
  baseURL = BASE_URL,
) {
  console.info(`BASE_URL = ${BASE_URL}`);// eslint-disable-line

  const request = axios.create({ baseURL });

  return {
    async get<T>(url: string) {
      const response = await request.get<T>(url);

      // no need to run `response.json()` data is already prepared
      return response.data;
    },

    async post<T>(url: string, data: any) {
      const response = await request.post<T>(url, data);

      return response.data;
    },

    async patch<T>(url: string, data: any) {
      const response = await request.patch<T>(url, data);

      return response.data;
    },

    async delete<T>(url: string) {
      // if we don't need the response data
      return request.delete<T>(url);
    },
  };
}
