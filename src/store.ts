import type { WebSocket } from 'ws';
import type { Client, Room, Message, ClientsMap, RoomsMap } from './types.js';

const DEFAULT_ROOM_ID = 'general';
const DEFAULT_ROOM_NAME = 'general';

class Store {
  private rooms: RoomsMap = new Map();
  private clients: ClientsMap = new Map();

  constructor() {
    this.rooms.set(DEFAULT_ROOM_ID, {
      id: DEFAULT_ROOM_ID,
      name: DEFAULT_ROOM_NAME,
      messages: [],
    });
  }

  // Clients
  addClient(ws: WebSocket): void {
    this.clients.set(ws, { username: null, roomId: null });
  }

  removeClient(ws: WebSocket): string | null {
    const client = this.clients.get(ws);
    const roomId = client?.roomId ?? null;

    this.clients.delete(ws);

    return roomId;
  }

  getClient(ws: WebSocket): Client | undefined {
    return this.clients.get(ws);
  }

  setClientUsername(ws: WebSocket, username: string): void {
    const client = this.clients.get(ws);

    if (client) {
      client.username = username;
    }
  }

  setClientRoom(ws: WebSocket, roomId: string | null): void {
    const client = this.clients.get(ws);

    if (client) {
      client.roomId = roomId;
    }
  }

  getClientsInRoom(roomId: string): Array<{ ws: WebSocket; client: Client }> {
    const result: Array<{ ws: WebSocket; client: Client }> = [];

    for (const [ws, client] of this.clients) {
      if (client.roomId === roomId) {
        result.push({ ws, client });
      }
    }

    return result;
  }

  getAllClients(): ClientsMap {
    return this.clients;
  }

  // Rooms
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  createRoom(name: string): Room {
    const id = crypto.randomUUID();
    const room: Room = { id, name, messages: [] };

    this.rooms.set(id, room);

    return room;
  }

  renameRoom(roomId: string, name: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }
    room.name = name;

    return true;
  }

  deleteRoom(roomId: string): boolean {
    if (roomId === DEFAULT_ROOM_ID) {
      return false;
    }

    return this.rooms.delete(roomId);
  }

  addMessage(roomId: string, message: Message): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }
    room.messages.push(message);

    return true;
  }

  getRoomMessages(roomId: string): Message[] {
    return this.rooms.get(roomId)?.messages ?? [];
  }
}

export const store = new Store();
