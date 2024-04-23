import { httpClient } from "../../../shared/api/http/httpClient";
import { Message } from "../types/messageTypes";

export const getAllMessages = (roomId: number): Promise<Message[]> => {
  return httpClient.get(`/message/${roomId}`);
};
