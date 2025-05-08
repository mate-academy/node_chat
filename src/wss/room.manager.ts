import { WebSocket } from 'ws';
import { MessagePreview } from '../types/MessagePreview';

interface MessageBroadcast {
  type: 'message';
  payload: MessagePreview;
}

interface NameChangedBroadcast {
  type: 'name_changed';
  payload: string;
}

type RoomBroadcastData = MessageBroadcast | NameChangedBroadcast;

class RoomManager {
  private rooms = new Map<string, Map<string, WebSocket>>();

  join(id: string, userId: string, ws: WebSocket) {
    if (!this.rooms.has(id)) {
      this.rooms.set(id, new Map());
    }

    this.rooms.get(id)!.set(userId, ws);
  }

  leave(id: string, ws: WebSocket) {
    const room = this.rooms.get(id);

    if (room) {
      for (const [userId, socket] of room.entries()) {
        if (socket === ws) {
          room.delete(userId);
          break;
        }
      }

      if (room.size === 0) {
        this.rooms.delete(id);
      }
    }
  }

  delete(id: string) {
    const room = this.rooms.get(id);

    if (room) {
      for (const [, client] of room) {
        if (client.readyState === WebSocket.OPEN) {
          client.close(4002, 'The room was deleted');
        }
      }

      this.rooms.delete(id);
    }
  }

  broadcast(id: string, data: RoomBroadcastData) {
    const room = this.rooms.get(id);

    if (room) {
      for (const [, client] of room) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      }
    }
  }

  getSocket(id: string, userId: string): WebSocket | undefined {
    return this.rooms.get(id)?.get(userId);
  }
}

export const roomManager = new RoomManager();
