
type Message = {
  id?: number;
  author: string,
  text: string,
  chatId: number,
  userId: number,
  date: string,
  read: boolean,
}

type MessageState = {
  messages: Message[];
  loading: boolean;
  error: string;
  newMessage: Message | null;
  unreadMessages: Message[],
  unreadLoaging: boolean,
  unreadError: string,
}

export type {
  Message, MessageState
}