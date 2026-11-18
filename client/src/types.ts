export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

// A message delivered live over the socket also says which room it belongs to
export interface LiveMessage extends Message {
  roomId: string;
}
