import type { Room } from '../WebSocketContext.tsx';

export type RoomMessage = {
  type: 'rooms';
  command: 'add' | 'rename' | 'delete' | 'join';
  room: Room;
  newTitle?: Room;
};
