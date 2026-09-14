import type { Room } from '../WebSocketContext.tsx';

export type TextMessage = {
  type: 'message' | 'login';
  room: Room;
  author: string;
  text: string;
};
