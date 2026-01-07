import { createClient } from '.';

export const httpClient = createClient();

httpClient.interceptors.response.use((res) => res.data);
