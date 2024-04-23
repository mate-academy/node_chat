import { ChatType } from "../types/chatTypes";
import { httpClient } from "../../../shared/api/http/httpClient";

export const getUserChats = (userId: number): Promise<ChatType[]> => {
  return httpClient.get(`/chat/${userId}`);
};
