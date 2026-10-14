/* eslint-disable */
import type { Message } from './Message';

export type Room = {
  id: string;
  roomName: string;
  users: string[];
  creatorId: string;
  messages: Message[];
};
