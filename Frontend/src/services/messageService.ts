import { httpClient } from '../http';
import * as Types from '../types';

function getAllByRoomId(roomId: string): Promise<Types.Message[]> {
  return httpClient.get(`/messages/${roomId}`);
}
function createOne(
  userId: string,
  roomId: string,
  text: string,
): Promise<Types.Message> {
  return httpClient.post('/messages', { text, userId, roomId });
}

export const messageService = {
  getAllByRoomId,
  createOne,
};
