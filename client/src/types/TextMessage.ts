import type { Room } from '../WebSocketContext.tsx';

export type TextMessage = {
  type: 'message';
  room: Room;
  author: string;
  text: string;
};
