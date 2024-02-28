export const socket = new WebSocket('ws://localhost:5000');

export interface Message {
  id: number;
  user: string;
  message: string;
  roomId: number;
}

export interface Room {
  id: number;
  name: string;
}
