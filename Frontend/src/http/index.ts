import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export function createClient(): AxiosInstance {
  return axios.create({
    baseURL,
  });
}

export const httpClient = createClient();

httpClient.interceptors.response.use(onResponseSuccess, onResponseError);

function onResponseSuccess(res: AxiosResponse) {
  return res.data;
}
function onResponseError(error) {
  if (error instanceof AxiosError) {
    console.error('Axios error:', error.message);
    console.error('Response data:', error.response?.data);
  } else if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('An unexpected error occurred:', error);
  }
}
