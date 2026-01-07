import axios from 'axios';

export function createClient() {
  return axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    withCredentials: true,
  });
}
