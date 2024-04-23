import { createClient } from ".";
import { AxiosResponse } from 'axios';

export const httpClient = createClient();

httpClient.interceptors.response.use(onResponseSuccess);

function onResponseSuccess(res: AxiosResponse) {
  return res.data;
}
