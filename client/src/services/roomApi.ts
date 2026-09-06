import { api } from "./axios";

export async function getRooms() {
  const response = await api.get('rooms')
  return response.data;
}

export async function createRoom(name: string, userId: string) {
  const response = await api.post('/rooms', { name, userId })
  return response.data;
}

export async function renameRoom(newName: string, roomId: string) {
  const response = await api.patch(`/rooms`, { newName, roomId })
  return response.data;
}

export async function joinRoom(userId: string, roomId: string) {
  const response = await api.patch(`/rooms/join`, { userId, roomId })
  return response.data;
}

export async function deleteRoom(roomId: string) {
  const response = await api.delete('/rooms', { data: { roomId }})
  return response.data;
}

export async function leaveRoom(userId: string, roomId: string) {
  const response = await api.patch('/rooms/leave', { userId, roomId })
  return response.data;
}

export async function checkUser(userId: string, roomId: string) {
  const response = await api.get(`/rooms/${roomId}/users/${userId}`)

  return response.data.isInRoom
}

