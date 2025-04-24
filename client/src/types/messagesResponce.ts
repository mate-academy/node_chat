export interface Message {
  createdAt: string;
  id: number;
  roomId: number;
  text: string;
  userId: number;
}

export interface MessageResponse {
  data: Message[];
  [key: string]: unknown;
}
