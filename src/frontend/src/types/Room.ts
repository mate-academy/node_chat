import type { Message } from './Message';

export type Room = {
  id: number;
  messages: Message[];
  name: string;
  users: string[];
  creatorId: number;
};
