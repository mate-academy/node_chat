import { httpClient } from "../../../shared/api/http/httpClient";

export const readMessage = (chatId: number, recipientId: number) => {
  return httpClient.patch(`/message/${chatId}/${recipientId}`);
}