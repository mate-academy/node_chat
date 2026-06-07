import { randomUUID } from 'node:crypto';

export type Message = {
  author: string;
  time: string;
  text: string;
};

export type Room = {
  id: string;
  name: string;
  messages: Message[];
};

const GENERAL_ROOM_ID = 'general';

const rooms: Room[] = [
  {
    id: GENERAL_ROOM_ID,
    name: 'General',
    messages: [],
  },
];

const normalizeRoomName = (roomName: string) => roomName.trim().toLowerCase();

const getAllRooms = () => {
  return rooms.map((room) => ({
    ...room,
    messages: [...room.messages],
  }));
};

const getRoomById = (roomId: string) => {
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return null;
  }

  return {
    ...room,
    messages: [...room.messages],
  };
};

const hasRoomWithName = (roomName: string, excludeRoomId?: string) => {
  const normalizedRoomName = normalizeRoomName(roomName);

  return rooms.some((room) => {
    if (excludeRoomId && room.id === excludeRoomId) {
      return false;
    }

    return normalizeRoomName(room.name) === normalizedRoomName;
  });
};

const createRoom = (roomName: string) => {
  const newRoom: Room = {
    id: randomUUID(),
    name: roomName.trim(),
    messages: [],
  };

  rooms.push(newRoom);

  return {
    ...newRoom,
    messages: [],
  };
};

const addMessageToRoom = (roomId: string, author: string, text: string) => {
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return null;
  }

  const message: Message = {
    author,
    time: new Date().toISOString(),
    text,
  };

  room.messages.push(message);

  return { ...message };
};

const updateRoom = (roomId: string, newRoomName: string) => {
  const room = rooms.find((item) => item.id === roomId);

  if (!room) {
    return null;
  }

  room.name = newRoomName.trim();

  return {
    ...room,
    messages: [...room.messages],
  };
};

const deleteRoom = (roomId: string) => {
  const roomIndex = rooms.findIndex((room) => room.id === roomId);

  if (roomIndex === -1) {
    return null;
  }

  const [deletedRoom] = rooms.splice(roomIndex, 1);

  return {
    ...deletedRoom,
    messages: [...deletedRoom.messages],
  };
};

export const roomStore = {
  GENERAL_ROOM_ID,
  getAllRooms,
  getRoomById,
  hasRoomWithName,
  createRoom,
  addMessageToRoom,
  updateRoom,
  deleteRoom,
};
