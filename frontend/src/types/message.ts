export interface Message {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  createdAt: Date;
}

export interface CreateMessageI extends Omit<Message, 'id' | 'createdAt'> {}
