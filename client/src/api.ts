import axios from 'axios';
import { Message } from './types/message';

axios.defaults.baseURL = 'http://localhost:3005';

export async function getMessage() {
  const res = await axios.get('/messages');

  return res.data as Message;
}

export async function getMessages() {
  const res = await axios.get('/messages');

  return res.data as Message[];
}

export function sendMessage(text: string, author: string, roomId: string) {
  return axios.post('/messages', { text, author, roomId });
}

export function createRoom(name: string) {
  return axios.post('/rooms', { name });
}

export function renameRoom(name: string, roomId: string) {
  return axios.patch(`/rooms/${roomId}`, { name })
}

export function deleteRoom(roomId: string) {
  return axios.delete(`/rooms/${roomId}`)
}