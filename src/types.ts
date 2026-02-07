import type { WebSocket } from 'ws';

export interface Message {
  author: string;
  time: string;
  text: string;
}

export interface Room {
  id: string;
  name: string;
  messages: Message[];
}

export interface Client {
  username: string | null;
  roomId: string | null;
}

export type ClientsMap = Map<WebSocket, Client>;
export type RoomsMap = Map<string, Room>;

// WebSocket message types
export type ClientMessageType =
  | 'login'
  | 'createRoom'
  | 'joinRoom'
  | 'leaveRoom'
  | 'renameRoom'
  | 'deleteRoom'
  | 'message';

export type ServerMessageType =
  | 'loginOk'
  | 'error'
  | 'roomList'
  | 'roomCreated'
  | 'roomRenamed'
  | 'roomDeleted'
  | 'joined'
  | 'userJoined'
  | 'userLeft'
  | 'message';

export interface ClientMessage {
  type: ClientMessageType;
  payload: unknown;
}

export interface ServerMessage {
  type: ServerMessageType;
  payload: unknown;
}
