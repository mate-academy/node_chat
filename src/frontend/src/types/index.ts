export type LoginResponse = {
  username: string;
};

export type Room = {
  name: string;
  creatorUsername: string;
  creatorUsernameKey: string;
  ownerUserId: number | null;
  members: number;
  preview: string;
  time: string;
  unread: number;
  joined: boolean;
};

export type ChatMessage = {
  id: number;
  author: string;
  date: string;
  time: string;
  body: string;
};

export type ChatRequestType =
  | 'rooms:list'
  | 'rooms:create'
  | 'rooms:rename'
  | 'rooms:delete'
  | 'rooms:join'
  | 'rooms:leave'
  | 'messages:list'
  | 'messages:create';

export type BroadcastPayloads = {
  'rooms:update': Room[];
  'messages:created': {
    roomName: string;
    message: ChatMessage;
  };
  'room:renamed': {
    oldName: string;
    room: Room;
  };
  'room:deleted': {
    name: string;
  };
};

export type ChatSocketEvent = keyof BroadcastPayloads;
export type ChatSocketListener = (
  data: BroadcastPayloads[ChatSocketEvent],
) => void;

export type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
};

export type ServerResponse = {
  type: 'response';
  requestId: number;
  ok: boolean;
  data?: unknown;
  message?: string;
};

export type ServerBroadcast = {
  [EventType in ChatSocketEvent]: {
    type: EventType;
    data: BroadcastPayloads[EventType];
  };
}[ChatSocketEvent];

export type ServerMessage = ServerResponse | ServerBroadcast;
