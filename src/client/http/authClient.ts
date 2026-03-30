import axios from 'axios';

export const authClient = axios.create({
  baseURL: `http${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
});

authClient.interceptors.response.use((res) => res.data);
