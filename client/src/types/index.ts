export interface User {
  username: string;
}

export interface Room {
  id: number;
  name: string;
}

export interface Message {
  id: number;
  roomId: number;
  author: string;
  text: string;
  createdAt: string;
}
