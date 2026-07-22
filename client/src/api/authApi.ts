import axios, { type AxiosResponse } from "axios";
import type { User } from "../utils/types";

const auth = axios.create({ baseURL: "http://localhost:3005" });

auth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => Promise.reject(error)
);

auth.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

function getMe(): Promise<AxiosResponse<User & {accessToken: string}>> {
  return auth.get("/auth/me");
}

export const authApi = {
  getMe,
};

