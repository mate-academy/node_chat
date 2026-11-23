import type { User } from './user';

export type WebSocketClient = WebSocket & {
  user: User;
};
