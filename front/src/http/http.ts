import axios, { AxiosInstance, AxiosResponse } from 'axios';

// const baseURL = process.env.VITE_API_URL;

const baseURL = 'http://localhost:5000';

export function createClient(): AxiosInstance {
  return axios.create({
    baseURL,
    withCredentials: true, 
  });
}

export const httpClient = createClient();

httpClient.interceptors.response.use((response) => {
  if (response.status >= 400) {
    throw response;
  }

  return response;
});
httpClient.interceptors.response.use(onResponseSuccess);

function onResponseSuccess(res: AxiosResponse) {
  return res.data;
}
