import { httpClient } from '../http/httpClient.js';

async function getAll() {
  const { data } = await httpClient.get('/rooms');
  return data;
}

function create(name) {
  return httpClient.post('/rooms', { name });
}

function rename(id, name) {
  return httpClient.patch(`/rooms/${id}`, { name });
}

function remove(id) {
  return httpClient.delete(`/rooms/${id}`);
}

async function getMessages(roomId) {
  const { data } = await httpClient.get(`/rooms/${roomId}/messages`);
  return data;
}

export const roomService = { getAll, create, rename, remove, getMessages };
