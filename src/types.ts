import type { WebSocket } from 'ws';

export interface User {
  name: string | null;
  roomId: string | null;
}

export interface WebSocketClient extends WebSocket {
  user: User;
}

export interface Message {
  author: string;
  time: Date;
  text: string;
}

export interface Room {
  id: string;
  name: string;
  owner: User;
  members: Set<WebSocketClient>;
  messages: Message[];
}

export interface IncomingMessage {
  type?: string;
  name?: string;
  roomId?: string;
  text?: string;
}
