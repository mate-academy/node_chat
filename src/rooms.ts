import { v4 as uuid } from 'uuid';
import { Room, User, WebSocketClient } from './types.js';

export const rooms = new Map<string, Room>();

export function createRoom(name: string, owner: User) {
  const roomId = uuid();

  const room: Room = {
    id: roomId,
    name,
    owner,
    members: new Set(),
    messages: [],
  };

  rooms.set(roomId, room);

  return room;
}

export function getRooms() {
  return Array.from(rooms.values()).map((room) => ({
    id: room.id,
    name: room.name,
    owner: room.owner,
    membersCount: room.members.size,
  }));
}

export function getRoomById(roomId: string) {
  return rooms.get(roomId);
}

export function addUser(userSocket: WebSocketClient, roomId: string) {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  if (userSocket.user.roomId) {
    removeUser(userSocket, userSocket.user.roomId);
  }

  room.members.add(userSocket);
  userSocket.user.roomId = roomId;

  return room;
}

export function removeUser(userSocket: WebSocketClient, roomId: string) {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  room.members.delete(userSocket);
  userSocket.user.roomId = null;

  return room;
}

export function deleteRoom(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) {
    return null;
  }

  const members = Array.from(room.members);

  members.forEach((member) => {
    member.user.roomId = null;
  });

  rooms.delete(roomId);

  return members;
}
