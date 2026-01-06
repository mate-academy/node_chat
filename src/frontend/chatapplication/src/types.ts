// src/types.ts
export interface Message {
  author: string;
  time: string;
  text: string;
}

export interface Room {
  name: string;
  messages: Message[];
}
