import { createContext } from 'react';
import type { ChatMessage, Room } from '../shared/types';

export interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (text: string, roomId: number, userId: number) => void;
  rooms: Room[];
  joinRoom: (roomId: number) => void;
  setMessages: (messages: ChatMessage[]) => void;
  createRoom: (name: string, userId: number) => void;
  renameRoom: (roomId: number, editName: string, userId: number) => void;
  deleteRoom: (roomId: number, userId: number) => void;
}

export const ChatContext = createContext<ChatContextType | null>(null);
