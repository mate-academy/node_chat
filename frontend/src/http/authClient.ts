import { createClient } from './index';

export const authClient = createClient();

authClient.interceptors.response.use(onResponseSuccess);

function onResponseSuccess<T>(res: { data: T }): T {
  return res.data;
}
