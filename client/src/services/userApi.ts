import { api } from "./axios";

export async function getUser(userId: string) {
  const response = await api.get(`/user/${userId}`,);
  return response.data;
}

export async function saveUser(username: string) {
  const response = await api.post('/user', { username })
  return response.data;
}
