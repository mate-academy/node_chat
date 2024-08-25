export interface Message {
  id: string;
  author: User;
  text: string;
  createdAt: string;
  updatedAt: string;
  roomId: string;
  userId: string;
}

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
