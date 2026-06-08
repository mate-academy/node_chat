// src/types.ts

export interface User {
  username: string;
  avatar: string;
}

export interface Message {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface Room {
  id: string;
  name: string;
  cover: string;
  creator: string;
  messages: Message[];
}
