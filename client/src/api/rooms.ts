import axios from 'axios';
import type { Room } from '../types';

const API_URL = 'http://localhost:3005';

export function getRooms() {
  return axios
    .get<Room[]>(`${API_URL}/rooms`)
    .then((response) => response.data);
}

export function createRoom(name: string) {
  return axios
    .post<Room>(`${API_URL}/rooms`, { name })
    .then((response) => response.data);
}

export function renameRoom(id: string, name: string) {
  return axios
    .patch<Room>(`${API_URL}/rooms/${id}`, { name })
    .then((response) => response.data);
}

export function deleteRoom(id: string) {
  return axios.delete<Room>(`${API_URL}/rooms/${id}`);
}
