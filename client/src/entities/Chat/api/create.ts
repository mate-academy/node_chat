import { httpClient } from "../../../shared/api/http/httpClient";
import { CreateChatRequest } from "../types/chatTypes";

export const create = (data: CreateChatRequest) => {
  return httpClient.post('/chat', data)
}