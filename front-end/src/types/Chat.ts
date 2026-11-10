import type { Message } from "./Message";

export interface Chat {
  id: string;
  name: string;
  author: string,
  users: string[];
  messages: Message[];
}