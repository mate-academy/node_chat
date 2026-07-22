import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

import { authApi } from "./authApi";
import type { Message, Room, User } from "../utils/types";

const client = axios.create({ baseURL: "http://localhost:3005" });

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await authApi.getMe();
      const accessToken = response.data.accessToken;

      localStorage.setItem("accessToken", accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return client.request(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("username");

      return Promise.reject(refreshError);
    }
  },
);


function getUser(
  userId: string
): Promise<AxiosResponse<Omit<User, "accessToken">>> {
  return client.get(`/user/${userId}`);
}

function createRoom(
  name: string,
  ownerId: string
): Promise<AxiosResponse<Room>> {
  return client.post("/room", { name, ownerId });
}

function getRooms(): Promise<AxiosResponse<Room[]>> {
  return client.get(`/room`);
}

function getRoom(roomId: string): Promise<AxiosResponse<Room>> {
  return client.get(`/room/${roomId}`);
}

function deleteRoom(roomId: string): Promise<AxiosResponse<Room>> {
  return client.delete(`/room/${roomId}`);
}

function renameRoom(id: string, name: string): Promise<AxiosResponse<void>> {
  return client.patch(`/room`, { id, name });
}

function addMemberRoom(
  id: string,
  userId: string
): Promise<AxiosResponse<void>> {
  return client.patch(`/room/addMember`, { id, userId });
}

function deleteMemberRoom(
  id: string,
  userId: string
): Promise<AxiosResponse<void>> {
  return client.patch(`/room/deleteMember`, { id, userId });
}

function getMessageByRoom(roomId: string): Promise<AxiosResponse<Message[]>> {
  return client.get(`/message/?roomId=${roomId}`);
}

function getMembersByRoom(roomId: string): Promise<AxiosResponse<User[]>> {
  return client.get(`/user/?roomId=${roomId}`);
}

function getAllUser(): Promise<AxiosResponse<Omit<User, "accessToken">[]>> {
  return client.get(`/user/all/`);
}

function createMessageByRoom(
  roomId: string,
  text: string
): Promise<AxiosResponse<Message[]>> {
  return client.post(`/message`, { roomId, text });
}

function createUser(
  username: string,
  colorHuePercent: number
): Promise<AxiosResponse<User & { accessToken: string }>> {
  return client.post("/user", { username, colorHuePercent });
}

export const clientApi = {
  createUser,
  createRoom,
  getRooms,
  getRoom,
  deleteRoom,
  renameRoom,
  getMessageByRoom,
  createMessageByRoom,
  getUser,
  getMembersByRoom,
  getAllUser,
  addMemberRoom,
  deleteMemberRoom,
};

