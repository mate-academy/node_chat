import { Message } from ".."
import { httpClient } from "../../../shared/api/http/httpClient"

export const getUnreadMessage = (userId: number, chats: number[]): Promise<Message[]> => {
  return httpClient.post('/message/unread', {
    userId,
    chats,
  })
}