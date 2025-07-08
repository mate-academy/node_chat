export interface User {
  id: string;
  name: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserChat {
  id: string;
  userId: string;
  chatId: string;
  chat: Chat;
}

export interface Message {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}
