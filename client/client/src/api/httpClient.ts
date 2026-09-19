import axios from "axios";

export const httpClient = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    config.headers.Authorization = `Bearer ${user}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
