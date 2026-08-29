import axios from 'axios';
import { API_URL } from './config';

const http = axios.create({ baseURL: API_URL });

export async function getRooms() {
  const { data } = await http.get('/api/rooms');
  return data;
}

export async function createRoom(name) {
  const { data } = await http.post('/api/rooms', { name });
  return data;
}

export async function renameRoom(id, name) {
  const { data } = await http.patch(`/api/rooms/${id}`, { name });
  return data;
}

export async function deleteRoom(id) {
  await http.delete(`/api/rooms/${id}`);
}

export async function getMessages(roomId) {
  const { data } = await http.get(`/api/rooms/${roomId}/messages`);
  return data;
}

export async function sendMessage(roomId, author, text) {
  const { data } = await http.post(`/api/rooms/${roomId}/messages`, { author, text });
  return data;
}
