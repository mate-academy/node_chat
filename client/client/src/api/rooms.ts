import type { Room } from "../types";
import { httpClient } from "./httpClient";

export const getRooms = async (): Promise<Room[]> => {
  const response = await httpClient.get<Room[]>("/rooms");
  return response.data;
};

export const getRoom = async (roomId: string): Promise<Room> => {
  const response = await httpClient.get<Room>(`/rooms/${roomId}`);
  return response.data;
};

export const createRoom = async (room: Pick<Room, "name">): Promise<Room> => {
  const response = await httpClient.post("/rooms", { room });
  return response.data;
};

export const removeRoom = async (id: string): Promise<void> => {
  await httpClient.delete(`/rooms/${id}`);
};

export const joinRoom = async (id: string): Promise<void> => {
  await httpClient.post(`/rooms/join/${id}`);
};

export const quitRoom = async (id: string): Promise<void> => {
  await httpClient.post(`/rooms/quit/${id}`);
};

export const renameRoom = async (
  id: string,
  newName: string,
): Promise<void> => {
  await httpClient.patch(`/rooms/rename/${id}`, { newName });
};
