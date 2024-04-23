import { httpClient } from "../../../shared/api/http/httpClient"
import { Message } from "../types/messageTypes";

export const send = async (msg: Message): Promise<Message> => {
  return httpClient.post('/message', msg);
}