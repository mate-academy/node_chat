import axios from 'axios';
import type { Message } from './types/message';

axios.defaults.baseURL = 'http://localhost:3000';

export type Room = {
  id: string;
  name: string;
};

// Optional HTTP API (server also supports sockets). Keeping this in sync avoids mentor-style rage.
export async function getRooms(): Promise<Room[]> {
  const res = await axios.get('/rooms');
  return res.data as Room[];
}

export async function getRoomMessages(roomId: string): Promise<Message[]> {
  const res = await axios.get(`/rooms/${roomId}/messages`);
  return res.data as Message[];
}

export async function postRoomMessage(roomId: string, text: string, author: string) {
  const res = await axios.post(`/rooms/${roomId}/messages`, { text, author });
  return res.data as Message;
}
