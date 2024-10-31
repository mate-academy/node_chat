import { createClient } from './index.js';

export const client = createClient();

client.interceptors.response.use((res) => res.data);
