import { Room } from '@/types/Room';
import { createContext } from 'react';

interface IChatContext {
  chats: Room[];
  createChat: (name: string) => Promise<void>;
  removeChat: (name: string) => Promise<void>;
}

export const ChatContext = createContext<IChatContext>({
  chats: [],
  createChat: async () => {},
  removeChat: async () => {},
});
