import { httpClient } from "../../../shared/api/http/httpClient"

export const readAll = (userId: number, chats: number[]) => {
  return httpClient.patch('/message/readAll', {
    userId,
    chats,
  })
}