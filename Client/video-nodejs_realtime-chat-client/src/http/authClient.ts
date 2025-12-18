import axios from 'axios';

// this client does not have auth interceptors
export const authClient = axios.create({
  baseURL: 'http://localhost:3005',
  withCredentials: true,
});

// to awoid getting `res.data` everywhere
authClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  res => res.data,
);
