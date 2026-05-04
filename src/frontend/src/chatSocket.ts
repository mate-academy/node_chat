import type {
  BroadcastPayloads,
  ChatMessage,
  ChatRequestType,
  ChatSocketEvent,
  ChatSocketListener,
  PendingRequest,
  Room,
  ServerBroadcast,
  ServerMessage,
  ServerResponse,
} from './types';

function getSocketUrl(username: string) {
  const query = new URLSearchParams({ username });

  return `ws://${globalThis.location.host}/ws?${query.toString()}`;
}

class ChatSocketClient {
  private username: string;

  private socket: WebSocket | null = null;

  private connectPromise: Promise<void> | null = null;

  private reconnectTimer = 0;

  private reconnectAttempts = 0;

  private nextRequestId = 1;

  private activeRoomName = '';

  private pendingRequests = new Map<number, PendingRequest>();

  private listeners = new Map<ChatSocketEvent, Set<ChatSocketListener>>();

  constructor(username: string) {
    this.username = username;
  }

  on<EventType extends ChatSocketEvent>(
    type: EventType,
    listener: (data: BroadcastPayloads[EventType]) => void,
  ) {
    const listeners = this.listeners.get(type) || new Set<ChatSocketListener>();
    const savedListener = listener as ChatSocketListener;

    listeners.add(savedListener);
    this.listeners.set(type, listeners);

    return () => {
      listeners.delete(savedListener);
    };
  }

  fetchRooms() {
    return this.request<Room[]>('rooms:list');
  }

  createRoom(name: string) {
    return this.request<Room>('rooms:create', { name });
  }

  renameRoom(name: string, nextName: string) {
    return this.request<Room>('rooms:rename', { name, nextName });
  }

  deleteRoom(name: string) {
    return this.request<void>('rooms:delete', { name });
  }

  joinRoom(name: string) {
    this.activeRoomName = name;

    return this.request<Room>('rooms:join', { name }).then((room) => {
      this.activeRoomName = room.name;

      return room;
    });
  }

  leaveRoom(name: string) {
    return this.request<Room>('rooms:leave', { name }).then((room) => {
      if (this.activeRoomName === room.name) {
        this.activeRoomName = '';
      }

      return room;
    });
  }

  fetchMessages(roomName: string) {
    this.activeRoomName = roomName;

    return this.request<ChatMessage[]>('messages:list', { roomName });
  }

  postMessage(roomName: string, body: string) {
    return this.request<ChatMessage>('messages:create', { roomName, body });
  }

  async request<ResponseData>(
    type: ChatRequestType,
    payload?: Record<string, string>,
  ) {
    await this.connect();

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Chat connection is not open.');
    }

    const requestId = this.nextRequestId;

    this.nextRequestId += 1;

    const responsePromise = new Promise<ResponseData>((resolve, reject) => {
      this.pendingRequests.set(requestId, {
        resolve: (value) => resolve(value as ResponseData),
        reject,
      });
    });

    try {
      this.socket.send(
        JSON.stringify({
          type,
          requestId,
          payload,
        }),
      );
    } catch (error) {
      this.pendingRequests.delete(requestId);
      throw error;
    }

    return responsePromise;
  }

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise((resolve, reject) => {
      const socket = new WebSocket(getSocketUrl(this.username));
      let settled = false;

      const failConnection = () => {
        if (settled) {
          return;
        }

        settled = true;
        this.connectPromise = null;
        reject(new Error('Could not connect to the chat server.'));
      };

      socket.addEventListener('open', () => {
        const shouldRestoreRoomView = this.reconnectAttempts > 0;

        settled = true;
        this.reconnectAttempts = 0;
        this.connectPromise = null;
        resolve();

        if (shouldRestoreRoomView) {
          this.restoreRoomView();
        }
      });

      socket.addEventListener('message', (event) => {
        this.handleMessage(event.data);
      });

      socket.addEventListener('close', () => {
        this.rejectPendingRequests();

        if (!settled) {
          failConnection();
        }

        this.connectPromise = null;
        this.reconnectOnce();
      });

      socket.addEventListener('error', () => {
        if (socket.readyState !== WebSocket.OPEN) {
          failConnection();
        }
      });

      this.socket = socket;
    });

    return this.connectPromise;
  }

  private reconnectOnce() {
    if (this.reconnectAttempts >= 1) {
      return;
    }

    this.reconnectAttempts += 1;
    globalThis.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = globalThis.setTimeout(() => {
      this.connect().catch(() => undefined);
    }, 500);
  }

  private rejectPendingRequests() {
    this.pendingRequests.forEach((request) => {
      request.reject(new Error('Chat connection was closed.'));
    });
    this.pendingRequests.clear();
  }

  private restoreRoomView() {
    if (!this.activeRoomName || !this.socket) {
      return;
    }

    try {
      this.socket.send(
        JSON.stringify({
          type: 'messages:list',
          requestId: this.nextRequestId,
          payload: {
            roomName: this.activeRoomName,
          },
        }),
      );
      this.nextRequestId += 1;
    } catch {
      // The next user action will open a new request if this restore fails.
    }
  }

  private handleMessage(rawData: MessageEvent['data']) {
    if (typeof rawData !== 'string') {
      return;
    }

    const message = JSON.parse(rawData) as ServerMessage;

    if (message.type === 'response') {
      this.handleResponse(message);

      return;
    }

    if (message.type === 'room:renamed') {
      if (this.activeRoomName === message.data.oldName) {
        this.activeRoomName = message.data.room.name;
      }
    }

    if (message.type === 'room:deleted') {
      if (this.activeRoomName === message.data.name) {
        this.activeRoomName = '';
      }
    }

    this.emit(message);
  }

  private handleResponse(message: ServerResponse) {
    const pendingRequest = this.pendingRequests.get(message.requestId);

    if (!pendingRequest) {
      return;
    }

    this.pendingRequests.delete(message.requestId);

    if (message.ok) {
      pendingRequest.resolve(message.data);

      return;
    }

    pendingRequest.reject(new Error(message.message || 'Chat request failed.'));
  }

  private emit(message: ServerBroadcast) {
    const listeners = this.listeners.get(message.type);

    if (!listeners) {
      return;
    }

    listeners.forEach((listener) => {
      listener(message.data);
    });
  }
}

const clients = new Map<string, ChatSocketClient>();

export function getChatSocket(username: string) {
  const cleanUsername = username.trim();
  let client = clients.get(cleanUsername);

  if (!client) {
    client = new ChatSocketClient(cleanUsername);
    clients.set(cleanUsername, client);
  }

  return client;
}
