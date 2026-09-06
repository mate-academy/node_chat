import { api } from "./axios";

export async function getMessages() {
  const response = await api.get('/chat')
  return response.data;
}

export async function getRoomMessages(roomId: string) {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
}

export async function postMessage(username: string, text: string, userId: string) {
  const response = await api.post('/chat', { username, text, userId })
  return response.data;
}

export async function postRoomMessage(
  username: string,
   text: string,
   roomId: string,
   userId: string
) {
  const response = await api.post(`/rooms/${roomId}`, { username, text, userId })
  return response.data;
}
