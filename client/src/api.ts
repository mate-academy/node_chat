import axios from 'axios';
import { Message } from './types/message';
import { Room } from './types/room';

axios.defaults.baseURL = 'http://localhost:3000';

export async function getRooms() {
  const res = await axios.get('/rooms');

  return res.data as Room[];
}

export function createRoom(name: string) {
  return axios.post('/rooms', { name });
}

export function renameRoom(roomId: string, name: string) {
  return axios.patch(`/rooms/${roomId}`, { name });
}

export function deleteRoom(roomId: string) {
  return axios.delete(`/rooms/${roomId}`);
}

export async function getMessages(roomId: string) {
  const res = await axios.get('/messages', {
    params: { roomId }
  });

  return res.data as Message[];
}

export function sendMessage(text: string, author: string, roomId: string) {
  return axios.post('/messages', { text, author, roomId });
}

export function sendUsername(name: string) {
  return axios.post('/users', { name });
}
