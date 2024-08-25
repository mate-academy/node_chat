import { httpClient } from '../http';
import * as Types from '../types';

function getAll(): Promise<Types.Room[]> {
  return httpClient.get('/rooms');
}
function createOne(name: string, userId: string): Promise<Types.Room> {
  return httpClient.post('/rooms', { name, userId });
}
function updateName(roomId: string, newName: string): Promise<Types.Room> {
  return httpClient.patch(`/rooms/${roomId}`, { name: newName });
}
function removeOne(roomId: string): void {
  httpClient.delete(`/rooms/${roomId}`);
}

export const roomService = {
  getAll,
  createOne,
  updateName,
  removeOne,
};
