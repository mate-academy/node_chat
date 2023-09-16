import { createClient } from "./index.js";

export const httpClient = createClient();

httpClient.interceptors.response.use((res) => res.data);
