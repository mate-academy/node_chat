import { httpClient } from "../http/httpClient.ts";

export const messageService = {
  sendMessage: (text: string, roomId: string, userId: string) => httpClient.post('/messages', { text, roomId, userId }),
 getAllRoomMessages: (roomId: string) =>
  httpClient.get(`/rooms/${roomId}/messages`)
}